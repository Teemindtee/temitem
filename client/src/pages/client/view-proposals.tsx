import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User } from "lucide-react";
import ClientHeader from "@/components/client-header";
import { apiRequest } from "@/lib/queryClient";
import type { Proposal } from "@shared/schema";

export default function ViewProposals() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      <div className="max-w-4xl mx-auto py-8 px-6">
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
            <Link href="/client/requests" className="text-red-600 hover:underline text-sm">
              Sort and Proposals →
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
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Finder Name */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Alex Johnson</h3>
                          <p className="text-sm text-gray-500">Professional Finder</p>
                        </div>
                      </div>
                    </div>

                    {/* Status/Action */}
                    <div className="col-span-2 text-center">
                      <Badge 
                        variant={proposal.status === 'active' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {proposal.status === 'pending' ? 'Active' : proposal.status}
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {proposal.estimatedDays ? `${proposal.estimatedDays} days` : 'Timeline'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-semibold text-green-600">
                        ${proposal.proposedBudget || '150-200'}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-3 text-right">
                      {proposal.status === 'pending' ? (
                        <Button 
                          onClick={() => acceptProposal.mutate(proposal.id)}
                          disabled={acceptProposal.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white px-6"
                        >
                          {acceptProposal.isPending ? 'Hiring...' : 'Hire Finder'}
                        </Button>
                      ) : (
                        <Badge variant="secondary">Hired</Badge>
                      )}
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
                        <h3 className="font-medium text-gray-900">Alex Johnson</h3>
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
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-6">
                      Hire Finder
                    </Button>
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
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-6">
                      Hire Finder
                    </Button>
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