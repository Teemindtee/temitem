import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Clock, DollarSign } from "lucide-react";
import ClientHeader from "@/components/client-header";
import StartConversationButton from "@/components/StartConversationButton";
import { apiRequest } from "@/lib/queryClient";
import type { Proposal } from "@shared/schema";
import { useState } from "react";

type ProposalWithDetails = Proposal & {
  finder: {
    id: string;
    user: { firstName: string; lastName: string; email: string; };
    completedJobs: number;
    rating: number;
  };
  request: {
    title: string;
    description: string;
    category: string;
    budgetMin: string;
    budgetMax: string;
  };
};

export default function ProposalDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const proposalId = params.id as string;
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    contractId?: string;
    amount?: number;
    paymentUrl?: string;
    reference?: string;
    findTitle?: string;
    finderName?: string;
  }>({ isOpen: false });

  const { data: proposal, isLoading } = useQuery<ProposalWithDetails>({
    queryKey: ['/api/proposals', proposalId],
    enabled: !!proposalId && !!user
  });

  const acceptProposal = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/proposals/${id}/accept`, { method: "POST" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/proposals', proposalId] });
      queryClient.invalidateQueries({ queryKey: ['/api/client/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/client/proposals'] });

      if (data.success && data.payment && data.payment.required) {
        // Open payment modal with the contract details
        setPaymentModal({
          isOpen: true,
          contractId: data.contract.id,
          amount: data.payment.amount,
          paymentUrl: data.payment.paymentUrl,
          reference: data.payment.reference,
          findTitle: data.contract.findTitle || proposal?.request.title || 'Find Request',
          finderName: data.contract.finderName || (proposal ? `${proposal.finder.user.firstName} ${proposal.finder.user.lastName}` : 'Finder'),
        });

        toast({
          title: "Contract Created!",
          description: "Please complete payment to fund the escrow and start work.",
        });
      } else {
        toast({
          title: "Success",
          description: "Proposal accepted and contract created!",
        });
        window.location.href = "/client/contracts";
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept proposal and create contract. Please try again.",
      });
    }
  });

  const handleAcceptProposal = (id: string) => {
    acceptProposal.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link href="/client/proposals">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Proposals
                </Button>
              </Link>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h1>
            <p className="text-gray-600 mb-6">The proposal you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/client/proposals">
              <Button>Back to Proposals</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If still loading or proposal not ready, don't render the main content
  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader />
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link href="/client/proposals">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Proposals
                </Button>
              </Link>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <ClientHeader />

        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link href="/client/proposals">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Proposals
                </Button>
              </Link>
              <div>
              <h1 className="text-2xl font-bold text-gray-900">Proposal Details</h1>
              <p className="text-gray-600">for "{proposal.request.title}"</p>
            </div>
          </div>

          {/* Proposal Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Proposal from{' '}
                  <Link href={`/finder-profile/${proposal.finder.id}`} className="text-finder-red hover:text-red-800 hover:underline cursor-pointer">
                    {proposal.finder.user.firstName} {proposal.finder.user.lastName}
                  </Link>
                </span>
                <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                  {proposal.status === 'pending' ? 'Active' : proposal.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Finder Profile Summary */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-finder-red/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-finder-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    <Link href={`/finder-profile/${proposal.finder.id}`} className="text-finder-red hover:text-red-800 hover:underline cursor-pointer">
                      {proposal.finder.user.firstName} {proposal.finder.user.lastName}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {proposal.finder.completedJobs || 0} jobs completed • {proposal.finder.rating || 5.0}★ rating
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₦{parseInt(proposal.price).toLocaleString()}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {proposal.timeline}
                  </div>
                </div>
              </div>

              {/* Proposal Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Approach & Methodology</h4>
                <p className="text-gray-700 leading-relaxed">{proposal.approach}</p>
              </div>

              {/* Additional Notes */}
              {proposal.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
                  <p className="text-gray-700 leading-relaxed">{proposal.notes}</p>
                </div>
              )}

              {/* Request Context */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Request Context</h4>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{proposal.request.title}</h5>
                    <Badge variant="outline">{proposal.request.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{proposal.request.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Budget: ${proposal.request.budgetMin} - ${proposal.request.budgetMax}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t">
                <div className="flex-1">
                  <StartConversationButton
                    proposalId={proposal.id}
                    finderName={`${proposal.finder.user.firstName} ${proposal.finder.user.lastName}`}
                  />
                </div>
                {proposal.status === 'pending' && (
                  <Button
                    onClick={() => handleAcceptProposal(proposal.id)}
                    className="bg-finder-red hover:bg-finder-red-dark text-white flex-1"
                    disabled={acceptProposal.isPending}
                  >
                    {acceptProposal.isPending ? "Accepting..." : "Accept Proposal"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal - Removed for Flutterwave streamlining */}
    </div>
  );
}