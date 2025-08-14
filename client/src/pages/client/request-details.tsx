import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, DollarSign, MapPin, User, Star, MessageCircle } from "lucide-react";
import ClientHeader from "@/components/client-header";
import FileDisplay from "@/components/file-display";
import { apiRequest } from "@/lib/queryClient";
import type { Request, Proposal } from "@shared/schema";

export default function RequestDetails() {
  const [match, params] = useRoute("/client/requests/:id");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestId = params?.id;

  const { data: request, isLoading: requestLoading } = useQuery<Request>({
    queryKey: ['/api/requests', requestId],
    enabled: !!requestId && !!user
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/requests', requestId, 'proposals'],
    enabled: !!requestId && !!user && !!request
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const acceptProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest("POST", `/api/proposals/${proposalId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests', requestId, 'proposals'] });
      toast({
        title: "Success!",
        description: "Proposal accepted successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept proposal",
      });
    }
  });

  if (requestLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
          <Link href="/client/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto py-4 px-6">
        <Link href="/client/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-8 px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">{request.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {request.timeframe || "Flexible timeline"}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Location flexible
                      </div>
                    </div>
                  </div>
                  <Badge variant={request.status === 'active' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{request.description}</p>
                  </div>

                  {/* Display attachments if any */}
                  {request.attachments && request.attachments.length > 0 && (
                    <FileDisplay 
                      files={request.attachments} 
                      title="Request Attachments"
                      className="border-0 bg-gray-50"
                    />
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Budget Range</h3>
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <DollarSign className="w-5 h-5 mr-1" />
                        ${request.budgetMin} - ${request.budgetMax}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proposals Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  Proposals ({proposals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                    <p className="text-gray-600">Finders will submit their proposals here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal: any) => (
                      <Card key={proposal.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Finder #{proposal.finderId}</h4>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  4.8 (15 reviews)
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                ${proposal.proposedBudget}
                              </div>
                              <div className="text-sm text-gray-600">
                                {proposal.estimatedDays} days
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{proposal.coverLetter}</p>
                          
                          {proposal.status === 'pending' && (
                            <Button 
                              onClick={() => acceptProposal.mutate(proposal.id)}
                              disabled={acceptProposal.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {acceptProposal.isPending ? 'Accepting...' : 'Accept Proposal'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Request Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <Badge variant={request.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                      {request.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="font-medium">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Proposals Received</div>
                    <div className="font-medium">{proposals.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}