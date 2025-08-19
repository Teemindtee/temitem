import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Gift, Calendar, User, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Finder {
  id: string;
  userId: string;
  findertokenBalance: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TokenGrant {
  id: string;
  finderId: string;
  amount: number;
  reason: string;
  grantedBy: string;
  createdAt: string;
  finder: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  grantedByUser: {
    firstName: string;
    lastName: string;
  };
}

interface MonthlyDistribution {
  id: string;
  finderId: string;
  month: number;
  year: number;
  tokensGranted: number;
  distributedAt: string;
  finder: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function TokenManagement() {
  const [selectedFinderId, setSelectedFinderId] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all finders
  const { data: finders = [], isLoading: isLoadingFinders } = useQuery({
    queryKey: ["/api/admin/users"],
    select: (data: any[]) => data.filter((user: any) => user.role === 'finder')
  });

  // Fetch token grants
  const { data: tokenGrants = [], isLoading: isLoadingGrants } = useQuery<TokenGrant[]>({
    queryKey: ["/api/admin/token-grants"],
  });

  // Fetch monthly distributions
  const { data: monthlyDistributions = [], isLoading: isLoadingDistributions } = useQuery({
    queryKey: ["/api/admin/monthly-distributions", selectedMonth, selectedYear],
    queryFn: () => apiRequest(`/api/admin/monthly-distributions?month=${selectedMonth}&year=${selectedYear}`)
  });

  // Distribute monthly tokens mutation
  const distributeMonthlyTokens = useMutation({
    mutationFn: () => apiRequest("/api/admin/distribute-monthly-tokens", {
      method: "POST",
    }),
    onSuccess: (data) => {
      toast({
        title: "Monthly Tokens Distributed",
        description: `Distributed to ${data.distributed} finders. ${data.alreadyDistributed} already received tokens this month.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/monthly-distributions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Distribution Failed",
        description: error.message || "Failed to distribute monthly tokens",
        variant: "destructive",
      });
    },
  });

  // Grant tokens to specific finder mutation
  const grantTokens = useMutation({
    mutationFn: (data: { finderId: string; amount: number; reason: string }) =>
      apiRequest("/api/admin/grant-tokens", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      toast({
        title: "Tokens Granted",
        description: "Tokens have been successfully granted to the finder.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/token-grants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowGrantDialog(false);
      setSelectedFinderId("");
      setGrantAmount("");
      setGrantReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Grant Failed",
        description: error.message || "Failed to grant tokens",
        variant: "destructive",
      });
    },
  });

  const handleGrantTokens = () => {
    if (!selectedFinderId || !grantAmount || !grantReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(grantAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    grantTokens.mutate({
      finderId: selectedFinderId,
      amount,
      reason: grantReason,
    });
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Coins className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold">Token Management</h1>
      </div>

      <Tabs defaultValue="distribute" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribute">Monthly Distribution</TabsTrigger>
          <TabsTrigger value="grant">Grant Tokens</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="distribute">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Token Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Distribute 20 tokens to all active finders for the current month.
                This can only be done once per month per finder.
              </p>
              
              <Button
                onClick={() => distributeMonthlyTokens.mutate()}
                disabled={distributeMonthlyTokens.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {distributeMonthlyTokens.isPending ? "Distributing..." : "Distribute Monthly Tokens"}
              </Button>

              {/* Current month's distribution status */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {months[new Date().getMonth()]} {new Date().getFullYear()} Distribution Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {monthlyDistributions.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Finders Received</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {monthlyDistributions.length * 20}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Tokens Distributed</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {finders.length - monthlyDistributions.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Pending Finders</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Grant Tokens to Finder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Grant Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Grant Tokens to Finder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="finder-select">Select Finder</Label>
                      <Select value={selectedFinderId} onValueChange={setSelectedFinderId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a finder..." />
                        </SelectTrigger>
                        <SelectContent>
                          {finders.map((finder: any) => (
                            <SelectItem key={finder.id} value={finder.id}>
                              {finder.firstName} {finder.lastName} ({finder.email})
                              {finder.finders?.[0] && (
                                <span className="ml-2 text-muted-foreground">
                                  - Balance: {finder.finders[0].findertokenBalance || 0} tokens
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(e.target.value)}
                        placeholder="Number of tokens to grant"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={grantReason}
                        onChange={(e) => setGrantReason(e.target.value)}
                        placeholder="Reason for granting tokens..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGrantTokens}
                        disabled={grantTokens.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {grantTokens.isPending ? "Granting..." : "Grant Tokens"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowGrantDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            {/* Token Grants History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Token Grants History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingGrants ? (
                  <div className="text-center py-4">Loading grants...</div>
                ) : tokenGrants.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No token grants found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tokenGrants.map((grant: TokenGrant) => (
                      <div
                        key={grant.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {grant.finder.user.firstName} {grant.finder.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {grant.finder.user.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            +{grant.amount} tokens
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            by {grant.grantedByUser.firstName} {grant.grantedByUser.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(grant.createdAt), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Distributions History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Distributions History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingDistributions ? (
                  <div className="text-center py-4">Loading distributions...</div>
                ) : monthlyDistributions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No distributions found for {months[selectedMonth - 1]} {selectedYear}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {monthlyDistributions.map((distribution: MonthlyDistribution) => (
                      <div
                        key={distribution.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {distribution.finder.user.firstName} {distribution.finder.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {distribution.finder.user.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            +{distribution.tokensGranted} tokens
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(new Date(distribution.distributedAt), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}