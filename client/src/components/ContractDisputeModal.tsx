import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContractDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle?: string;
}

export function ContractDisputeModal({
  isOpen,
  onClose,
  contractId,
  contractTitle
}: ContractDisputeModalProps) {
  const { t } = useTranslation();
  const [disputeType, setDisputeType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitDisputeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/contracts/${contractId}/dispute`, {
        method: "POST",
        body: JSON.stringify({
          type: disputeType,
          description,
          evidence: evidence || null
        })
      });
    },
    onSuccess: () => {
      toast({
        title: t('dispute.dispute_submitted'),
        description: t('dispute.dispute_submitted_desc'),
      });
      onClose();
      resetForm();
      // Invalidate contract queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/client/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finder/contracts"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit dispute. Please try again.",
      });
    }
  });

  const resetForm = () => {
    setDisputeType("");
    setDescription("");
    setEvidence("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeType || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a dispute type and provide a description.",
      });
      return;
    }
    submitDisputeMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">{t('dispute.submit_dispute')}</DialogTitle>
              {contractTitle && (
                <p className="text-sm text-gray-500 mt-1">For: {contractTitle}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="disputeType" className="text-sm font-medium mb-2 block">
              {t('dispute.dispute_type')} *
            </Label>
            <Select value={disputeType} onValueChange={setDisputeType}>
              <SelectTrigger>
                <SelectValue placeholder={t('dispute.dispute_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract_dispute">{t('dispute.contract_issue')}</SelectItem>
                <SelectItem value="payment_dispute">{t('dispute.payment_issue')}</SelectItem>
                <SelectItem value="quality_dispute">{t('dispute.quality_issue')}</SelectItem>
                <SelectItem value="delivery_dispute">{t('dispute.delivery_issue')}</SelectItem>
                <SelectItem value="communication_dispute">{t('dispute.communication_issue')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">
              {t('dispute.description')} *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide a clear and detailed explanation of the issue you're experiencing.
            </p>
          </div>

          <div>
            <Label htmlFor="evidence" className="text-sm font-medium mb-2 block">
              {t('dispute.evidence')}
            </Label>
            <Textarea
              id="evidence"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Any supporting evidence, links, or additional context..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include any relevant screenshots, messages, or documentation that supports your case.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Important Notes:</p>
                <ul className="text-amber-700 space-y-1 list-disc list-inside">
                  <li>Disputes will be reviewed by our support team within 24-48 hours</li>
                  <li>Provide accurate and honest information</li>
                  <li>Both parties will be contacted during the review process</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitDisputeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitDisputeMutation.isPending || !disputeType || !description.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitDisputeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Dispute"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}