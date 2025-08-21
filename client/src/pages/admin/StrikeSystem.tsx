import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Shield, Users, FileText, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import { SeverityBadge, getSeverityConfig } from "@/components/severity-badge";

interface Strike {
  id: string;
  userId: string;
  strikeLevel: number;
  offense: string;
  offenseType: string;
  evidence: string;
  issuedBy: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  notes?: string;
}

interface Dispute {
  id: string;
  userId: string;
  strikeId: string;
  type: string;
  description: string;
  evidence?: string;
  submittedAt: Date;
  status: string;
  resolution?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface StrikeStats {
  totalUsers: number;
  usersWithActiveStrikes: number;
  strikeLevelBreakdown: { [key: number]: number };
  recentStrikes: number;
  disputesInReview: number;
}

interface OffenseDefinition {
  offense: string;
  strikeLevel: number;
  applicableRoles: string[];
  resolution: string;
}

export default function StrikeSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedOffense, setSelectedOffense] = useState("");
  const [evidence, setEvidence] = useState("");
  const [contextId, setContextId] = useState("");
  const [isIssueStrikeOpen, setIsIssueStrikeOpen] = useState(false);

  // Fetch strike statistics
  const { data: strikeStats = {} as StrikeStats } = useQuery<StrikeStats>({
    queryKey: ['/api/admin/strike-stats'],
  });

  // Fetch all disputes
  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/admin/disputes'],
  });

  // Fetch offense types for selected role
  const { data: offenseTypes = [] } = useQuery<OffenseDefinition[]>({
    queryKey: ['/api/offenses', selectedRole],
    enabled: !!selectedRole,
  });

  // Fetch clients and finders for strike assignment (admins cannot receive strikes)
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    select: (data: any[]) => data?.filter((user: any) => user.role !== 'admin') || [],
  });

  // Issue strike mutation
  const issueStrikeMutation = useMutation({
    mutationFn: async (data: { userId: string; offenseType: string; evidence: string; userRole: string; contextId?: string }) => {
      return await apiRequest('/api/admin/strikes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Strike Issued",
        description: "The strike has been successfully issued to the user.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/strike-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
      setIsIssueStrikeOpen(false);
      setSelectedUserId("");
      setSelectedRole("");
      setSelectedOffense("");
      setEvidence("");
      setContextId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update dispute mutation
  const updateDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, updates }: { disputeId: string; updates: any }) => {
      return await apiRequest(`/api/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      toast({
        title: "Dispute Updated",
        description: "The dispute status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleIssueStrike = () => {
    if (!selectedUserId || !selectedOffense || !evidence || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    issueStrikeMutation.mutate({
      userId: selectedUserId,
      offenseType: selectedOffense,
      evidence,
      userRole: selectedRole,
      contextId: contextId || undefined,
    });
  };

  const handleDisputeUpdate = (disputeId: string, status: string, resolution?: string) => {
    updateDisputeMutation.mutate({
      disputeId,
      updates: {
        status,
        resolution,
        reviewedAt: new Date(),
      },
    });
  };

  // Severity helper functions now handled by SeverityBadge component

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'investigating': return "bg-blue-100 text-blue-800";
      case 'resolved': return "bg-green-100 text-green-800";
      case 'rejected': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="strikes" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Strike System
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">Community protection and behavior management</p>
          </div>
          <Dialog open={isIssueStrikeOpen} onOpenChange={setIsIssueStrikeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Issue Strike
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Strike to User</DialogTitle>
              <DialogDescription>
                Issue a strike to a user for policy violations or inappropriate behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">User Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="finder">Finder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedRole && (
                <div>
                  <Label htmlFor="offense">Offense Type</Label>
                  <Select value={selectedOffense} onValueChange={setSelectedOffense}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select offense type" />
                    </SelectTrigger>
                    <SelectContent>
                      {offenseTypes?.map((offense: OffenseDefinition) => (
                        <SelectItem key={offense.offense} value={offense.offense}>
                          <div className="flex items-center justify-between w-full">
                            <span className="flex-1">{offense.offense}</span>
                            <SeverityBadge 
                              level={offense.strikeLevel} 
                              variant="compact"
                              className="ml-2"
                            />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="evidence">Evidence</Label>
                <Textarea 
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Provide detailed evidence and reasoning for the strike..."
                />
              </div>
              <div>
                <Label htmlFor="context">Context ID (Optional)</Label>
                <Input
                  value={contextId}
                  onChange={(e) => setContextId(e.target.value)}
                  placeholder="Contract ID, Find ID, or Proposal ID for context"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleIssueStrike}
                disabled={issueStrikeMutation.isPending}
              >
                {issueStrikeMutation.isPending ? "Issuing..." : "Issue Strike"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        
        {/* Severity Legend */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800/80 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              Severity Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((level) => (
                <SeverityBadge 
                  key={level} 
                  level={level} 
                  variant="detailed"
                  className="border-2 text-xs sm:text-sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg sm:text-2xl font-bold">{strikeStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">With Strikes</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg sm:text-2xl font-bold">{strikeStats?.usersWithActiveStrikes || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Recent</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg sm:text-2xl font-bold">{strikeStats?.recentStrikes || 0}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Disputes</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg sm:text-2xl font-bold">{strikeStats?.disputesInReview || 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Protection</CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg sm:text-2xl font-bold text-green-600">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Strike Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Strike Level Distribution</CardTitle>
          <CardDescription>Breakdown of users by their current strike levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((level) => {
              const count = strikeStats?.strikeLevelBreakdown?.[level] || 0;
              const config = getSeverityConfig(level);
              
              return (
                <div key={level} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="text-3xl font-bold">
                      {count}
                    </div>
                  </div>
                  <SeverityBadge 
                    level={level} 
                    variant="compact"
                    className="mb-2"
                  />
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {config.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {count === 1 ? 'user' : 'users'}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Strike Distribution</span>
              <span className="text-sm text-gray-500">
                {Object.values(strikeStats?.strikeLevelBreakdown || {}).reduce((a, b) => a + b, 0)} users affected
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              {[1, 2, 3, 4].map((level) => {
                const count = strikeStats?.strikeLevelBreakdown?.[level] || 0;
                const total = Object.values(strikeStats?.strikeLevelBreakdown || {}).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors = {
                  1: 'bg-yellow-500',
                  2: 'bg-orange-500', 
                  3: 'bg-red-500',
                  4: 'bg-gray-900'
                };
                
                return (
                  <div 
                    key={level}
                    className={`h-full ${colors[level as keyof typeof colors]} inline-block`}
                    style={{ width: `${percentage}%` }}
                    title={`Level ${level}: ${count} users (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Disputes */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Disputes</CardTitle>
          <CardDescription>User appeals and complaints requiring review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disputes?.filter((dispute: Dispute) => dispute.status === 'pending' || dispute.status === 'investigating').map((dispute: Dispute) => (
              <div key={dispute.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(dispute.status)}>
                      {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {new Date(dispute.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDisputeUpdate(dispute.id, 'investigating')}
                      disabled={updateDisputeMutation.isPending}
                    >
                      Investigate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDisputeUpdate(dispute.id, 'resolved', 'Dispute resolved after review')}
                      disabled={updateDisputeMutation.isPending}
                    >
                      Resolve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDisputeUpdate(dispute.id, 'rejected', 'Dispute rejected after review')}
                      disabled={updateDisputeMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>Type:</strong> {dispute.type.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Description:</strong> {dispute.description}</p>
                  {dispute.evidence && <p><strong>Evidence:</strong> {dispute.evidence}</p>}
                </div>
              </div>
            ))}
            {(!disputes || disputes.filter((d: Dispute) => d.status === 'pending' || d.status === 'investigating').length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No pending disputes to review
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}