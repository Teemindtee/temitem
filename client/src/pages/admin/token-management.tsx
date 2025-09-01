import { useState, useEffect } from "react";
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
import { Coins, Gift, Calendar, User, Clock, TrendingUp, Target, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import AdminHeader from "@/components/admin-header";

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
  userId?: string;
  finderId?: string;
  userType: 'finder' | 'client';
  amount: number;
  reason: string;
  grantedBy: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  finder?: {
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
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState<"finder" | "client">("finder");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [highBudgetThreshold, setHighBudgetThreshold] = useState("");
  const [highBudgetTokenCost, setHighBudgetTokenCost] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users (finders and clients)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"]
  });

  // Filter users by role
  const finders = users.filter((user: any) => user.role === 'finder');
  const clients = users.filter((user: any) => user.role === 'client');

  // Fetch admin settings
  const { data: settings } = useQuery({
    queryKey: ['/api/admin/settings']
  });

  // Set initial values when settings are loaded
  useEffect(() => {
    if (settings) {
      setHighBudgetThreshold(settings.highBudgetThreshold || "100000");
      setHighBudgetTokenCost(settings.highBudgetTokenCost || "5");
    }
  }, [settings]);

  // Fetch token grants
  const { data: tokenGrants = [], isLoading: isLoadingGrants } = useQuery<TokenGrant[]>({
    queryKey: ["/api/admin/token-grants"],
  });

  // Fetch monthly distributions
  const { data: monthlyDistributions = [], isLoading: isLoadingDistributions } = useQuery({
    queryKey: ["/api/admin/monthly-distributions", selectedMonth, selectedYear],
    queryFn: () => apiRequest(`/api/admin/monthly-distributions?month=${selectedMonth}&year=${selectedYear}`)
  });

  // Sync token balances mutation
  const syncTokenBalances = useMutation({
    mutationFn: () => apiRequest("/api/admin/sync-token-balances", {
      method: "POST",
    }),
    onSuccess: (data) => {
      toast({
        title: "Token Balances Synced",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/token-grants"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync token balances",
        variant: "destructive",
      });
    },
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

  // Grant tokens to specific user mutation
  const grantTokens = useMutation({
    mutationFn: (data: { userId: string; userRole: string; amount: number; reason: string }) =>
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
        description: `Tokens have been successfully granted to the ${selectedUserRole}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/token-grants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowGrantDialog(false);
      setSelectedUserId("");
      setSelectedUserRole("finder");
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

  // Update high budget settings mutation
  const updateHighBudgetSettings = useMutation({
    mutationFn: (data: { highBudgetThreshold: string; highBudgetTokenCost: string }) =>
      apiRequest("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "High budget posting settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateHighBudgetSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highBudgetThreshold || !highBudgetTokenCost) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    updateHighBudgetSettings.mutate({
      highBudgetThreshold,
      highBudgetTokenCost,
    });
  };

  const handleGrantTokens = () => {
    if (!selectedUserId || !grantAmount || !grantReason) {
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
      userId: selectedUserId,
      userRole: selectedUserRole,
      amount,
      reason: grantReason,
    });
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminHeader currentPage="token-management" />
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Token Management</h1>
        </div>

      <Tabs defaultValue="distribute" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="distribute" className="text-xs sm:text-sm px-2 py-2">
            <span className="hidden sm:inline">Monthly Distribution</span>
            <span className="sm:hidden">Monthly</span>
          </TabsTrigger>
          <TabsTrigger value="grant" className="text-xs sm:text-sm px-2 py-2">
            <span className="hidden sm:inline">Grant Tokens</span>
            <span className="sm:hidden">Grant</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 py-2">
            <span className="hidden sm:inline">High Budget Settings</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-2">History</TabsTrigger>
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
              <p className="text-muted-foreground text-sm sm:text-base">
                Distribute 20 tokens to all active finders for the current month.
                This can only be done once per month per finder.
              </p>

              <Button
                onClick={() => distributeMonthlyTokens.mutate()}
                disabled={distributeMonthlyTokens.isPending}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm sm:text-base"
              >
                {distributeMonthlyTokens.isPending ? "Distributing..." : "Distribute Monthly Tokens"}
              </Button>

              {/* Current month's distribution status */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3">
                  {months[new Date().getMonth()]} {new Date().getFullYear()} Distribution Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {monthlyDistributions.length}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Finders Received</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {monthlyDistributions.length * 20}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Total Tokens Distributed</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">
                          {finders.length - monthlyDistributions.length}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Pending Finders</div>
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
                  <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                    Grant Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base">Grant Tokens to {selectedUserRole === 'finder' ? 'Finder' : 'Client'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                      <Label htmlFor="role-select">User Type</Label>
                      <Select value={selectedUserRole} onValueChange={(value: "finder" | "client") => {
                        setSelectedUserRole(value);
                        setSelectedUserId(""); // Reset user selection when role changes
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finder">Finder</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="user-select">Select {selectedUserRole === 'finder' ? 'Finder' : 'Client'}</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Choose a ${selectedUserRole}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedUserRole === 'finder' ? finders : clients).map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                              <span className="ml-2 text-muted-foreground">
                                - Balance: {user.findertokenBalance || 0} tokens
                              </span>
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

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleGrantTokens}
                        disabled={grantTokens.isPending}
                        className="bg-red-600 hover:bg-red-700 flex-1 text-sm"
                      >
                        {grantTokens.isPending ? "Granting..." : "Grant Tokens"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowGrantDialog(false)}
                        className="flex-1 text-sm"
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

        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Token Balance Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Token Balance Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">Token Balance Synchronization</h3>
                  <p className="text-yellow-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    If you notice discrepancies in finder token balances, use this tool to recalculate and sync all balances based on transaction history.
                  </p>
                  <Button
                    onClick={() => syncTokenBalances.mutate()}
                    disabled={syncTokenBalances.isPending}
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 w-full sm:w-auto text-sm sm:text-base"
                  >
                    {syncTokenBalances.isPending ? "Syncing..." : "Sync All Token Balances"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* High Budget Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  High Budget Posting Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateHighBudgetSettings} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* High Budget Threshold */}
                    <div className="space-y-3">
                      <Label htmlFor="highBudgetThreshold" className="text-slate-700 text-sm font-semibold flex items-center">
                        <Target className="w-4 h-4 mr-2 text-purple-600" />
                        High Budget Threshold (₦)
                      </Label>
                      <Input
                        id="highBudgetThreshold"
                        type="number"
                        min="1000"
                        step="100"
                        value={highBudgetThreshold}
                        onChange={(e) => setHighBudgetThreshold(e.target.value)}
                        className="h-12 text-lg bg-white/80 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                        placeholder="Enter threshold amount"
                      />
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-700">
                          <strong>Current:</strong> ₦{parseInt(highBudgetThreshold || "100000").toLocaleString()} threshold
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Posts with budget ≥ this amount require findertokens
                        </p>
                      </div>
                    </div>

                    {/* High Budget Token Cost */}
                    <div className="space-y-3">
                      <Label htmlFor="highBudgetTokenCost" className="text-slate-700 text-sm font-semibold flex items-center">
                        <Coins className="w-4 h-4 mr-2 text-indigo-600" />
                        Required Findertokens
                      </Label>
                      <Input
                        id="highBudgetTokenCost"
                        type="number"
                        min="1"
                        value={highBudgetTokenCost}
                        onChange={(e) => setHighBudgetTokenCost(e.target.value)}
                        className="h-12 text-lg bg-white/80 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                        placeholder="Enter token count"
                      />
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p className="text-sm text-indigo-700">
                          <strong>Current:</strong> {highBudgetTokenCost || "5"} findertokens required
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                          Tokens deducted for high-budget posts
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateHighBudgetSettings.isPending}
                      className="bg-red-600 hover:bg-red-700 px-6"
                    >
                      {updateHighBudgetSettings.isPending ? "Updating..." : "Update High Budget Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
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
                    {tokenGrants.map((grant: TokenGrant) => {
                      const userName = grant.user?.firstName && grant.user?.lastName 
                        ? `${grant.user.firstName} ${grant.user.lastName}`
                        : grant.finder?.user?.firstName && grant.finder?.user?.lastName
                        ? `${grant.finder.user.firstName} ${grant.finder.user.lastName}`
                        : 'Unknown User';
                      
                      const userEmail = grant.user?.email || grant.finder?.user?.email || 'No email';
                      
                      return (
                        <div
                          key={grant.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <div className="font-medium text-sm sm:text-base truncate">{userName}</div>
                                <Badge variant="outline" className="text-xs w-fit">
                                  {grant.userType}
                                </Badge>
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                {userEmail}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 text-right">
                            <Badge variant="secondary" className="text-xs">
                              +{grant.amount} tokens
                            </Badge>
                            <div className="flex flex-col text-right">
                              <div className="text-xs text-muted-foreground">
                                by {grant.grantedByUser?.firstName || 'Unknown'} {grant.grantedByUser?.lastName || 'Admin'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(grant.createdAt), 'MMM d, yyyy h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-full sm:w-40">
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
                    <SelectTrigger className="w-full sm:w-32">
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base truncate">
                              {distribution.finder?.user?.firstName || 'Unknown'} {distribution.finder?.user?.lastName || 'User'}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                              {distribution.finder?.user?.email || 'No email available'}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 text-right">
                          <Badge variant="secondary" className="text-xs">
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
    </div>
  );
}