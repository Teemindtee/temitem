import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  timeframe: string;
  clientId: string;
}

interface SubmitProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

export default function SubmitProposalModal({ isOpen, onClose, request }: SubmitProposalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    approach: "",
    price: "",
    timeline: "",
    notes: "",
  });

  const submitProposalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/proposals", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/balance'] });
      toast({
        title: "Proposal submitted successfully",
        description: "Your proposal has been sent to the client. 1 token has been deducted from your balance.",
      });
      setFormData({ approach: "", price: "", timeline: "", notes: "" });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit proposal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request) return;
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < request.budgetMin || price > request.budgetMax) {
      toast({
        title: "Invalid price",
        description: `Price must be between $${request.budgetMin} and $${request.budgetMax}`,
        variant: "destructive",
      });
      return;
    }

    submitProposalMutation.mutate({
      findId: request.id,
      approach: formData.approach.trim(),
      price: price.toString(),
      timeline: formData.timeline.trim(),
      notes: formData.notes.trim() || undefined,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-finder-text">
            Submit Proposal
          </DialogTitle>
        </DialogHeader>
        
        {/* Request Summary */}
        <Card className="bg-finder-gray">
          <CardContent className="p-4">
            <h3 className="font-semibold text-finder-text mb-2">Request: {request.title}</h3>
            <p className="text-finder-text-light text-sm">
              Client ID: {request.clientId.slice(-8)} • Budget: ${request.budgetMin} - ${request.budgetMax}
            </p>
            <p className="text-finder-text-light text-sm mt-1">
              {request.description.substring(0, 150)}...
            </p>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="approach">Your Approach</Label>
            <Textarea
              id="approach"
              rows={4}
              placeholder="Describe how you plan to find what the client needs. Include your experience, resources, and timeline..."
              value={formData.approach}
              onChange={(e) => handleChange('approach', e.target.value)}
              required
              className="focus:ring-finder-red focus:border-finder-red resize-none"
            />
          </div>

          <div>
            <Label htmlFor="price">Your Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="35.00"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
                className="pl-8 focus:ring-finder-red focus:border-finder-red"
              />
            </div>
            <p className="text-sm text-finder-text-light mt-1">
              Client's budget range: ${request.budgetMin} - ${request.budgetMax}
            </p>
          </div>

          <div>
            <Label htmlFor="timeline">Estimated Timeline</Label>
            <Select value={formData.timeline} onValueChange={(value) => handleChange('timeline', value)}>
              <SelectTrigger className="focus:ring-finder-red focus:border-finder-red">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Within 24 hours</SelectItem>
                <SelectItem value="1-2days">1-2 days</SelectItem>
                <SelectItem value="3-5days">3-5 days</SelectItem>
                <SelectItem value="1week">1 week</SelectItem>
                <SelectItem value="2weeks">2+ weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Any additional information you'd like to share..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="focus:ring-finder-red focus:border-finder-red resize-none"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-finder-text font-medium">Proposal Cost: 1 Token</span>
              <span className="text-sm text-finder-text-light">This will be deducted from your balance</span>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-finder-red hover:bg-finder-red-dark font-semibold"
                disabled={submitProposalMutation.isPending}
              >
                {submitProposalMutation.isPending ? "Submitting..." : "Submit Proposal (Use 1 Token)"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
