import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ClientHeader from "@/components/client-header";
import { 
  ArrowLeft, 
  User, 
  MessageCircle, 
  Clock, 
  DollarSign, 
  Star,
  CheckCircle2,
  Mail,
  Calendar,
  Briefcase,
  Filter,
  Search,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Proposal } from "@shared/schema";

export default function ViewProposals() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/client/proposals'],
    enabled: !!user && user.role === 'client'
  });

  const acceptProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest("/api/proposals/" + proposalId + "/accept", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/proposals'] });
      toast({
        title: "Proposal Accepted!",
        description: "You can now start working with this finder.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to Accept Proposal",
        description: "Please try again later.",
      });
    }
  });

  const createConversation = useMutation({
    mutationFn: async (proposalId: string) => {
      console.log('Creating conversation for proposal:', proposalId);
      
      return apiRequest("/api/messages/conversations", {
        method: "POST",
        body: JSON.stringify({
          proposalId: proposalId
        }),
      });
    },
    onSuccess: (data) => {
      console.log('Navigation to conversation:', data.id);
      navigate(`/messages/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Conversation creation error:', error);
      console.log('Error message to show user:', error.message);
      toast({
        variant: "destructive",
        title: "Unable to Start Conversation",
        description: "Please try again later.",
      });
    }
  });

  const handleMessageFinder = (proposalId: string) => {
    createConversation.mutate(proposalId);
  };

  // Redirect if not authenticated or not client
  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">This page is only available for clients.</p>
          <Button onClick={() => navigate("/finder/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Go to Finder Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (proposalsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Proposals</h2>
          <p className="text-slate-600">Please wait while we fetch your proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ClientHeader currentPage="proposals" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Received Proposals
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 mb-4">
            Review proposals from talented finders and choose the best match for your project
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <Button 
              onClick={() => navigate("/client/create-find")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className="w-4 h-4 mr-2" />
              Post New Find
            </Button>
            <Button 
              onClick={() => navigate("/client/dashboard")}
              variant="outline" 
              className="border-slate-200 hover:bg-slate-50"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              View My Finds
            </Button>
          </div>
        </div>

        {/* Proposals Section */}
        {proposals.length === 0 ? (
          /* Empty State */
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">No Proposals Yet</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-md mx-auto">
                Finders will submit their proposals for your finds here. Once you post a find, qualified finders will start sending proposals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/client/create-find")}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Post Your First Find
                </Button>
                <Button 
                  onClick={() => navigate("/browse-requests")}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50"
                >
                  Browse Public Finds
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Proposals Grid */
          <div className="space-y-4 sm:space-y-6">
            {proposals.map((proposal: any) => (
              <Card key={proposal.id} className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6 sm:p-8">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden space-y-6">
                    {/* Finder Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 border-2 border-blue-200">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {(proposal.finderName || "Unknown").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {proposal.finderName || "Unknown Finder"}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={proposal.status === 'pending' ? 'default' : 'secondary'}
                              className={`text-xs ${proposal.status === 'pending' 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {proposal.status === 'pending' ? '✨ Available' : proposal.status}
                            </Badge>
                            <div className="flex items-center text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-medium ml-1">4.9</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Find Details */}
                    {proposal.findTitle && (
                      <div className="bg-slate-50/80 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-1">Find:</h4>
                        <p className="text-sm text-slate-700">{proposal.findTitle}</p>
                      </div>
                    )}

                    {/* Proposal Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50/80 rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-green-700">
                          ₦{proposal.price ? parseInt(proposal.price).toLocaleString() : 'TBD'}
                        </div>
                        <div className="text-xs text-green-600">Proposed Price</div>
                      </div>
                      <div className="bg-blue-50/80 rounded-lg p-4 text-center">
                        <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm font-semibold text-blue-700">
                          {proposal.timeline || 'To be discussed'}
                        </div>
                        <div className="text-xs text-blue-600">Timeline</div>
                      </div>
                    </div>

                    {/* Proposal Message */}
                    {proposal.coverLetter && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Proposal Message:</h4>
                        <p className="text-sm text-slate-700 bg-slate-50/80 rounded-lg p-4 leading-relaxed">
                          {proposal.coverLetter.length > 150 
                            ? `${proposal.coverLetter.slice(0, 150)}...` 
                            : proposal.coverLetter
                          }
                        </p>
                      </div>
                    )}

                    {/* Action Buttons - Mobile */}
                    <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200">
                      {proposal.status === 'pending' ? (
                        <>
                          <Button 
                            onClick={() => acceptProposal.mutate(proposal.id)}
                            disabled={acceptProposal.isPending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {acceptProposal.isPending ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Hiring...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Hire This Finder
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={() => handleMessageFinder(proposal.id)}
                            disabled={createConversation.isPending}
                            variant="outline" 
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            {createConversation.isPending ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Starting Chat...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message Finder
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary" className="w-full justify-center py-3 bg-green-100 text-green-800 border-green-200">
                            ✅ Hired & Active
                          </Badge>
                          <Button 
                            onClick={() => handleMessageFinder(proposal.id)}
                            disabled={createConversation.isPending}
                            variant="outline" 
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            {createConversation.isPending ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Starting Chat...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Continue Chat
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <div className="flex items-start justify-between">
                      {/* Left Section - Finder Info */}
                      <div className="flex items-start space-x-6 flex-1">
                        <Avatar className="w-16 h-16 border-2 border-blue-200">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                            {(proposal.finderName || "Unknown").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                {proposal.finderName || "Unknown Finder"}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <Badge 
                                  variant={proposal.status === 'pending' ? 'default' : 'secondary'}
                                  className={`${proposal.status === 'pending' 
                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {proposal.status === 'pending' ? '✨ Available' : '✅ Hired'}
                                </Badge>
                                <div className="flex items-center text-amber-500">
                                  <Star className="w-4 h-4 fill-current" />
                                  <span className="text-sm font-medium ml-1">4.9 (127 reviews)</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price Display */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-700">
                                ₦{proposal.price ? parseInt(proposal.price).toLocaleString() : 'TBD'}
                              </div>
                              <div className="text-sm text-slate-600">Proposed Price</div>
                            </div>
                          </div>

                          {/* Timeline & Find Info */}
                          <div className="flex items-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700">
                                {proposal.timeline || 'Timeline: To be discussed'}
                              </span>
                            </div>
                            {proposal.findTitle && (
                              <div className="flex items-center space-x-2">
                                <Briefcase className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-700 font-medium">
                                  {proposal.findTitle}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Proposal Message */}
                          {proposal.coverLetter && (
                            <div className="bg-slate-50/80 rounded-lg p-4 mb-4">
                              <h4 className="font-medium text-slate-900 mb-2">Proposal Message:</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {proposal.coverLetter.length > 300 
                                  ? `${proposal.coverLetter.slice(0, 300)}...` 
                                  : proposal.coverLetter
                                }
                              </p>
                            </div>
                          )}

                          {/* Action Buttons - Desktop */}
                          <div className="flex items-center space-x-3">
                            {proposal.status === 'pending' ? (
                              <>
                                <Button 
                                  onClick={() => acceptProposal.mutate(proposal.id)}
                                  disabled={acceptProposal.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                                >
                                  {acceptProposal.isPending ? (
                                    <>
                                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                      Hiring...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Hire Finder
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  onClick={() => handleMessageFinder(proposal.id)}
                                  disabled={createConversation.isPending}
                                  variant="outline" 
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 px-6"
                                >
                                  {createConversation.isPending ? (
                                    <>
                                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                      Starting...
                                    </>
                                  ) : (
                                    <>
                                      <MessageCircle className="w-4 h-4 mr-2" />
                                      Message
                                    </>
                                  )}
                                </Button>
                              </>
                            ) : (
                              <Button 
                                onClick={() => handleMessageFinder(proposal.id)}
                                disabled={createConversation.isPending}
                                variant="outline" 
                                className="border-blue-200 text-blue-700 hover:bg-blue-50 px-6"
                              >
                                {createConversation.isPending ? (
                                  <>
                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                    Starting Chat...
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Continue Chat
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {proposals.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Need More Options?</h3>
              <p className="text-slate-600 mb-4">
                Post additional finds or browse other clients' public requests
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/client/create-find")}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Post Another Find
                </Button>
                <Button 
                  onClick={() => navigate("/browse-requests")}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50"
                >
                  Browse Public Finds
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}