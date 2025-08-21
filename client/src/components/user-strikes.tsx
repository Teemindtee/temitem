import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, Shield, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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

interface UserRestriction {
  id: string;
  userId: string;
  restrictionType: string;
  reason: string;
  createdBy: string;
  createdAt: Date;
  endDate?: Date;
  isActive: boolean;
}

interface StrikeRestrictions {
  restrictions: UserRestriction[];
  activeStrikes: Strike[];
  strikeLevel: number;
  canPost: boolean;
  canApply: boolean;
  canMessage: boolean;
  isSuspended: boolean;
  isBanned: boolean;
}

interface UserStrikesProps {
  userId?: string;
  showTitle?: boolean;
}

export default function UserStrikes({ userId, showTitle = true }: UserStrikesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStrike, setSelectedStrike] = useState<Strike | null>(null);
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);

  const targetUserId = userId || user?.id;

  // Fetch user strikes and restrictions
  const { data: strikeData, isLoading } = useQuery({
    queryKey: ['/api/users', targetUserId, 'strikes'],
    enabled: !!targetUserId,
  });

  const strikes: Strike[] = strikeData?.strikes || [];
  const restrictions: StrikeRestrictions = strikeData?.restrictions || {
    restrictions: [],
    activeStrikes: [],
    strikeLevel: 0,
    canPost: true,
    canApply: true,
    canMessage: true,
    isSuspended: false,
    isBanned: false
  };

  // Submit dispute mutation
  const submitDisputeMutation = useMutation({
    mutationFn: async (data: { strikeId: string; description: string; evidence?: string }) => {
      return await apiRequest(`/api/strikes/${data.strikeId}/dispute`, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted for review. We'll respond within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', targetUserId, 'strikes'] });
      setIsDisputeDialogOpen(false);
      setDisputeDescription("");
      setDisputeEvidence("");
      setSelectedStrike(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStrikeLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2: return "bg-orange-100 text-orange-800 border-orange-200";
      case 3: return "bg-red-100 text-red-800 border-red-200";
      case 4: return "bg-gray-900 text-white border-gray-900";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStrikeLevelLabel = (level: number) => {
    switch (level) {
      case 1: return "Warning";
      case 2: return "System Restrictions";
      case 3: return "Temporary Suspension";
      case 4: return "Permanent Ban";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-red-100 text-red-800";
      case 'expired': return "bg-gray-100 text-gray-600";
      case 'disputed': return "bg-blue-100 text-blue-800";
      case 'withdrawn': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRestrictionColor = (type: string) => {
    switch (type) {
      case 'posting': return "bg-yellow-100 text-yellow-800";
      case 'applications': return "bg-orange-100 text-orange-800";
      case 'messaging': return "bg-blue-100 text-blue-800";
      case 'limited_features': return "bg-purple-100 text-purple-800";
      case 'suspended': return "bg-red-100 text-red-800";
      case 'banned': return "bg-gray-900 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmitDispute = () => {
    if (!selectedStrike) return;
    
    if (!disputeDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a description for your dispute.",
        variant: "destructive",
      });
      return;
    }

    submitDisputeMutation.mutate({
      strikeId: selectedStrike.id,
      description: disputeDescription,
      evidence: disputeEvidence || undefined,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading strike information...</div>;
  }

  const activeStrikes = strikes.filter(s => s.status === 'active');
  const hasActiveRestrictions = restrictions.restrictions.length > 0;

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Community Standing</h2>
        </div>
      )}

      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Account Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${restrictions.strikeLevel > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {restrictions.strikeLevel}
              </div>
              <div className="text-sm text-gray-600">Active Strikes</div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-medium ${restrictions.canPost ? 'text-green-600' : 'text-red-600'}`}>
                {restrictions.canPost ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Can Post</div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-medium ${restrictions.canApply ? 'text-green-600' : 'text-red-600'}`}>
                {restrictions.canApply ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Can Apply</div>
            </div>
            <div className="text-center">
              <div className={`text-sm font-medium ${restrictions.canMessage ? 'text-green-600' : 'text-red-600'}`}>
                {restrictions.canMessage ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Can Message</div>
            </div>
          </div>

          {restrictions.isBanned && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 font-medium">Account Banned</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Your account has been permanently banned from the platform.
              </p>
            </div>
          )}

          {restrictions.isSuspended && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800 font-medium">Account Suspended</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Your account is temporarily suspended.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Restrictions */}
      {hasActiveRestrictions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Restrictions</CardTitle>
            <CardDescription>Current limitations on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restrictions.restrictions.map((restriction) => (
                <div key={restriction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getRestrictionColor(restriction.restrictionType)}>
                        {restriction.restrictionType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {restriction.endDate && (
                        <span className="text-sm text-gray-600">
                          Until {new Date(restriction.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{restriction.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strikes History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strike History</CardTitle>
          <CardDescription>
            {strikes.length === 0 
              ? "You have a clean record with no strikes." 
              : `You have ${activeStrikes.length} active strike${activeStrikes.length !== 1 ? 's' : ''} out of ${strikes.length} total.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {strikes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Great job! You have no strikes on your account.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {strikes.map((strike) => (
                <div key={strike.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStrikeLevelColor(strike.strikeLevel)}>
                        Level {strike.strikeLevel}: {getStrikeLevelLabel(strike.strikeLevel)}
                      </Badge>
                      <Badge className={getStatusColor(strike.status)}>
                        {strike.status.charAt(0).toUpperCase() + strike.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(strike.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Offense:</span> {strike.offense}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Evidence:</span> {strike.evidence}
                    </div>
                    {strike.expiresAt && (
                      <div>
                        <span className="font-medium text-gray-700">Expires:</span> {new Date(strike.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    {strike.notes && (
                      <div>
                        <span className="font-medium text-gray-700">Notes:</span> {strike.notes}
                      </div>
                    )}
                  </div>

                  {strike.status === 'active' && (
                    <div className="mt-3 pt-3 border-t">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedStrike(strike);
                          setIsDisputeDialogOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Dispute Strike
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Strike</DialogTitle>
            <DialogDescription>
              If you believe this strike was issued in error, you can submit a dispute for review.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStrike && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Strike Details:</div>
                  <div>Level {selectedStrike.strikeLevel}: {selectedStrike.offense}</div>
                  <div className="text-gray-600 mt-1">{selectedStrike.evidence}</div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Explain why you believe this strike was issued in error..."
                />
              </div>
              
              <div>
                <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>
                <Textarea
                  id="evidence"
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Provide any additional evidence or context..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={handleSubmitDispute}
              disabled={submitDisputeMutation.isPending}
            >
              {submitDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}