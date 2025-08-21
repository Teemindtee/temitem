import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SeverityBadge } from "@/components/severity-badge";

interface AdminIssueStrikeProps {
  userId: string;
  userRole: 'client' | 'finder';
  userName?: string;
  contextId?: string; // Contract ID or Find ID for reference
  contextType?: 'contract' | 'find';
  trigger?: React.ReactNode;
  onStrikeIssued?: () => void;
}

interface OffenseDefinition {
  offense: string;
  strikeLevel: number;
  applicableRoles: string[];
  resolution: string;
}

export default function AdminIssueStrike({ 
  userId, 
  userRole, 
  userName, 
  contextId, 
  contextType,
  trigger,
  onStrikeIssued 
}: AdminIssueStrikeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOffense, setSelectedOffense] = useState("");
  const [evidence, setEvidence] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch offense types for the user's role
  const { data: offenseTypes } = useQuery({
    queryKey: ['/api/offenses', userRole],
    enabled: !!userRole && isDialogOpen,
  });

  // Issue strike mutation
  const issueStrikeMutation = useMutation({
    mutationFn: async (data: { userId: string; offenseType: string; evidence: string; userRole: string; contextId?: string }) => {
      return await apiRequest('/api/admin/strikes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      console.log("Strike issued successfully:", data);
      toast({
        title: "Strike Issued",
        description: `Strike has been successfully issued to ${userName || 'the user'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/strike-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'strikes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDialogOpen(false);
      setSelectedOffense("");
      setEvidence("");
      onStrikeIssued?.();
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
    console.log("Handle issue strike called");
    if (!selectedOffense || !evidence.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an offense type and provide evidence.",
        variant: "destructive",
      });
      return;
    }

    console.log("Issuing strike with data:", {
      userId,
      offenseType: selectedOffense,
      evidence: evidence.trim(),
      userRole,
      contextId,
    });

    issueStrikeMutation.mutate({
      userId,
      offenseType: selectedOffense,
      evidence: evidence.trim(),
      userRole,
      contextId,
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <AlertTriangle className="h-4 w-4 mr-2" />
      Issue Strike
    </Button>
  );

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Strike dialog trigger clicked");
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div onClick={handleTriggerClick}>
          {trigger || defaultTrigger}
        </div>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking on dropdown trigger
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Issue Strike</DialogTitle>
          <DialogDescription>
            Issue a strike to {userName || `this ${userRole}`} for policy violations or inappropriate behavior.
            {contextId && contextType && (
              <span className="block mt-1 text-sm text-blue-600">
                Context: {contextType.charAt(0).toUpperCase() + contextType.slice(1)} #{contextId.slice(0, 8)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>User Information</Label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <div>Name: {userName || 'Unknown'}</div>
              <div>Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</div>
              <div>ID: {userId.slice(0, 8)}...</div>
            </div>
          </div>

          <div>
            <Label htmlFor="offense">Offense Type</Label>
            <Select value={selectedOffense} onValueChange={setSelectedOffense}>
              <SelectTrigger>
                <SelectValue placeholder="Select offense type" />
              </SelectTrigger>
              <SelectContent>
                {(offenseTypes || []).map((offense: OffenseDefinition) => (
                  <SelectItem key={offense.offense} value={offense.offense}>
                    <div className="flex items-center gap-2 py-1">
                      <span>{offense.offense}</span>
                      <SeverityBadge level={offense.strikeLevel} variant="compact" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="evidence">Evidence & Details</Label>
            <Textarea 
              id="evidence"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              onFocus={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              placeholder="Provide detailed evidence, reasoning, and any relevant information about the violation..."
              rows={4}
              className="resize-none"
            />
          </div>

          {selectedOffense && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
              <strong>Warning:</strong> This action will issue a strike that may result in automatic restrictions, suspensions, or other consequences based on the user's strike history.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleIssueStrike}
            disabled={issueStrikeMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {issueStrikeMutation.isPending ? "Issuing..." : "Issue Strike"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}