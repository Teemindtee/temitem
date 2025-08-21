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
  const { data: strikeStats } = useQuery({
    queryKey: ['/api/admin/strike-stats'],
  });

  // Fetch all disputes
  const { data: disputes } = useQuery({
    queryKey: ['/api/admin/disputes'],
  });

  // Fetch offense types for selected role
  const { data: offenseTypes } = useQuery({
    queryKey: ['/api/offenses', selectedRole],
    enabled: !!selectedRole,
  });

  // Fetch all users for strike assignment
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Issue strike mutation
  const issueStrikeMutation = useMutation({
    mutationFn: async (data: { userId: string; offenseType: string; evidence: string; userRole: string; contextId?: string }) => {
      return await apiRequest('/api/admin/strikes', 'POST', data);
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
      return await apiRequest(`/api/admin/disputes/${disputeId}`, 'PATCH', updates);
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

  const getStrikeLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-yellow-100 text-yellow-800";
      case 2: return "bg-orange-100 text-orange-800";
      case 3: return "bg-red-100 text-red-800";
      case 4: return "bg-gray-900 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strike System</h1>
          <p className="text-gray-600">Community protection and behavior management</p>
        </div>
        <Dialog open={isIssueStrikeOpen} onOpenChange={setIsIssueStrikeOpen}>
          <DialogTrigger asChild>
            <Button>
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
                          {offense.offense} (Level {offense.strikeLevel})
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

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strikeStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users with Strikes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strikeStats?.usersWithActiveStrikes || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Strikes</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strikeStats?.recentStrikes || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Disputes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strikeStats?.disputesInReview || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Level</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
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
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{strikeStats?.strikeLevelBreakdown?.[1] || 0}</div>
              <div className="text-sm text-gray-600">Level 1 (Warning)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{strikeStats?.strikeLevelBreakdown?.[2] || 0}</div>
              <div className="text-sm text-gray-600">Level 2 (Restricted)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{strikeStats?.strikeLevelBreakdown?.[3] || 0}</div>
              <div className="text-sm text-gray-600">Level 3 (Suspended)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{strikeStats?.strikeLevelBreakdown?.[4] || 0}</div>
              <div className="text-sm text-gray-600">Level 4 (Banned)</div>
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
  );
}