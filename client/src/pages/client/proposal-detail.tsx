import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, User, Clock, DollarSign } from "lucide-react";
import ClientHeader from "@/components/client-header";
import StartConversationButton from "@/components/StartConversationButton";
import type { Proposal } from "@shared/schema";

type ProposalWithDetails = Proposal & {
  finder: {
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
  const proposalId = params.id as string;
  
  const { data: proposal, isLoading } = useQuery<ProposalWithDetails>({
    queryKey: ['/api/proposals', proposalId],
    enabled: !!proposalId && !!user
  });

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

  if (!proposal) {
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
                <span>Proposal from {proposal.finder.user.firstName} {proposal.finder.user.lastName}</span>
                <Badge variant={proposal.status === 'accepted' ? 'default' : 'secondary'}>
                  {proposal.status === 'pending' ? 'Active' : proposal.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Finder Profile Summary */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {proposal.finder.user.firstName} {proposal.finder.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {proposal.finder.completedJobs || 0} jobs completed • {proposal.finder.rating || 5.0}★ rating
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${proposal.price}</div>
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
                  <Button className="bg-red-600 hover:bg-red-700 text-white flex-1">
                    Accept Proposal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}