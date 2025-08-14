import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, MessageCircle } from "lucide-react";
import ClientHeader from "@/components/client-header";
import StartConversationButton from "@/components/StartConversationButton";
import { apiRequest } from "@/lib/queryClient";
import type { Proposal } from "@shared/schema";

export default function ViewProposals() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is a client, redirect if not
  if (user && user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available for clients.</p>
          <Link href="/finder/dashboard">
            <Button>Go to Finder Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/client/proposals'],
    enabled: !!user
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
      queryClient.invalidateQueries({ queryKey: ['/api/client/proposals'] });
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

  if (proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="proposals" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
        {/* Back Button */}
        <Link href="/client/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">View Proposals</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Review and manage proposals from finders</p>
            <Link href="/client/browse-requests" className="text-red-600 hover:underline text-sm">
              View All Requests →
            </Link>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-4">Finders will submit their proposals for your requests here.</p>
                <Link href="/client/create-request">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Post a New Request
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            proposals.map((proposal: any) => (
              <Card key={proposal.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Mobile Layout */}
                  <div className="block md:hidden space-y-4">
                    {/* Finder Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {proposal.finderName || "Unknown Finder"}
                          </h3>
                          <p className="text-sm text-gray-500">Professional Finder</p>
                        </div>
                      </div>
                      <Badge 
                        variant={proposal.status === 'pending' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {proposal.status === 'pending' ? 'Active' : proposal.status}
                      </Badge>
                    </div>

                    {/* Price and Timeline */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-lg font-semibold text-green-600">${proposal.price || 'TBD'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Timeline</p>
                        <p className="text-sm font-medium text-gray-900">{proposal.timeline || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      {proposal.status === 'pending' ? (
                        <>
                          <Button 
                            onClick={() => acceptProposal.mutate(proposal.id)}
                            disabled={acceptProposal.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white w-full"
                          >
                            {acceptProposal.isPending ? 'Hiring...' : 'Hire Finder'}
                          </Button>
                          <StartConversationButton 
                            proposalId={proposal.id} 
                            className="w-full"
                            variant="outline"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Finder
                          </StartConversationButton>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary" className="w-full justify-center">Hired</Badge>
                          <StartConversationButton 
                            proposalId={proposal.id} 
                            className="w-full"
                            variant="outline"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Finder
                          </StartConversationButton>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    {/* Finder Name */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {proposal.finderName || "Unknown Finder"}
                          </h3>
                          <p className="text-sm text-gray-500">Professional Finder</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <Badge 
                        variant={proposal.status === 'pending' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {proposal.status === 'pending' ? 'Active' : proposal.status}
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {proposal.timeline || 'Not specified'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-semibold text-green-600">
                        ${proposal.price || 'TBD'}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-3 text-right">
                      <div className="space-y-2">
                        {proposal.status === 'pending' ? (
                          <>
                            <Button 
                              onClick={() => acceptProposal.mutate(proposal.id)}
                              disabled={acceptProposal.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white px-6 w-full"
                            >
                              {acceptProposal.isPending ? 'Hiring...' : 'Hire Finder'}
                            </Button>
                            <StartConversationButton 
                              proposalId={proposal.id} 
                              className="w-full"
                              variant="outline"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </StartConversationButton>
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary">Hired</Badge>
                            <StartConversationButton 
                              proposalId={proposal.id} 
                              className="w-full mt-2"
                              variant="outline"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </StartConversationButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Proposal Details */}
                  {proposal.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Proposal:</h4>
                      <p className="text-sm text-gray-700">{proposal.coverLetter}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sample Static Proposals to match the mockup exactly */}
        {proposals.length === 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sample Proposals</h3>
            
            {/* Alex Johnson Proposal */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          <Link href={`/finder-profile/sample-finder-1`} className="text-red-600 hover:text-red-800 hover:underline cursor-pointer">
                            Alex Johnson
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500">Proposed Price: $50-65</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-medium text-gray-900">Timeline</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-lg font-semibold text-green-600">$50-65</div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="space-y-2">
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-6 w-full">
                        Hire Finder
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => window.location.href = '/messages'}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Alex
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Second Proposal */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Amy Johnson</h3>
                        <p className="text-sm text-gray-500">Professional Finder</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-medium text-gray-900">Timeline</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-lg font-semibold text-green-600">$75-100</div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="space-y-2">
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-6 w-full">
                        Hire Finder
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => window.location.href = '/messages'}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Amy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}