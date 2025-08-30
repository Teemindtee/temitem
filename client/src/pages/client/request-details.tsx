import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  MapPin, 
  User, 
  Star, 
  MessageCircle,
  Calendar,
  Tag,
  FileText,
  Eye,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Share2,
  Filter,
  Loader2,
  Package,
  Award
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import ClientHeader from "@/components/client-header";

interface FindDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
  timeframe?: string;
  status: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  clientId: string;
  client?: {
    firstName: string;
    lastName: string;
  };
  _count?: {
    proposals: number;
  };
}

interface Proposal {
  id: string;
  findId: string;
  finderId: string;
  amount: string;
  price: string; // Added price field
  deliveryTime: string;
  status: string;
  createdAt: string;
  finder?: {
    id: string;
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    };
    completedJobs: number;
    rating: number;
  };
}

export default function RequestDetails() {
  const { id: findId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: find, isLoading: findLoading } = useQuery<FindDetails>({
    queryKey: ['/api/finds', findId],
    enabled: !!findId && !!user
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/finds', findId, 'proposals'],
    enabled: !!findId && !!user && !!find
  });

  const acceptProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest(`/api/proposals/${proposalId}/accept`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/finds', findId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finds', findId] });
      
      if (data.payment && data.payment.required) {
        toast({
          title: "Proposal Accepted!",
          description: "Please complete payment to fund the escrow and start work.",
        });
        // You can add payment modal logic here if needed
      } else {
        toast({
          title: "Proposal Accepted!",
          description: "The proposal has been accepted and a contract has been created.",
        });
      }
    },
    onError: (error: any) => {
      console.error('Accept proposal error:', error);
      const errorMessage = error.message || "Please try again later.";
      toast({
        variant: "destructive",
        title: "Failed to Accept Proposal",
        description: errorMessage,
      });
    }
  });

  // Redirect if not authenticated or not client
  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">This find is only accessible by clients.</p>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (findLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ClientHeader currentPage="finds" />

        <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-4"></div>
              <div className="h-32 bg-slate-200 rounded-lg mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-20 bg-slate-200 rounded-lg"></div>
                <div className="h-20 bg-slate-200 rounded-lg"></div>
                <div className="h-20 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-white/70 backdrop-blur-sm rounded-2xl"></div>
              <div className="h-96 bg-white/70 backdrop-blur-sm rounded-2xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!find) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">Find Not Found</h3>
          <p className="text-slate-600 mb-6">The find you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate("/client/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate status metrics
  const proposalCount = find._count?.proposals || proposals.length || 0;
  const statusColor = find.status === 'active' 
    ? 'bg-green-100 text-green-800 border-green-200'
    : find.status === 'completed'
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-amber-100 text-amber-800 border-amber-200';

  const statusIcon = find.status === 'active' 
    ? '🚀'
    : find.status === 'completed'
    ? '✅'
    : '⏳';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ClientHeader currentPage="finds" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Find Header */}
        <div className="mb-8">
          <div className="text-center sm:text-left mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              {find.title}
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 mb-4">
              Posted on {format(new Date(find.createdAt), 'MMM d, yyyy')} • {proposalCount} proposals received
            </p>
          </div>

          {/* Quick Stats */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1">Budget Range</p>
                  <p className="text-sm sm:text-lg font-bold text-green-600">
                    ₦{parseInt(find.budgetMin || "0").toLocaleString()} - ₦{parseInt(find.budgetMax || "0").toLocaleString()}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1">Proposals</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">{proposalCount}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1">Timeline</p>
                  <p className="text-sm sm:text-lg font-bold text-amber-600">
                    {find.timeframe || "Flexible"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1">Category</p>
                  <p className="text-sm sm:text-lg font-bold text-purple-600 capitalize">
                    {find.category}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Find Details */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="bg-slate-50/80 rounded-lg p-6 mb-6">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {find.description}
                  </p>
                </div>

                {/* Attachments */}
                {find.attachments && find.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Attachments ({find.attachments.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {find.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                attachment-{index + 1}
                              </p>
                              <p className="text-xs text-slate-500">
                                Click to download
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposals */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center text-slate-900">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Proposals ({proposals.length})
                  </div>
                  {proposals.length > 0 && (
                    <Button 
                      onClick={() => navigate(`/client/proposals?findId=${findId}`)}
                      variant="outline" 
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Proposals Yet</h3>
                    <p className="text-slate-600 mb-6">
                      Your find is live and finders will start submitting proposals soon.
                    </p>
                    <Button 
                      onClick={() => navigate("/client/dashboard")}
                      variant="outline" 
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.slice(0, 3).map((proposal) => (
                      <div 
                        key={proposal.id}
                        className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-10 h-10 border-2 border-blue-200">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                                {((proposal.finder?.user.firstName || "") + (proposal.finder?.user.lastName || ""))
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {proposal.finder?.user.firstName} {proposal.finder?.user.lastName}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 text-amber-500 fill-current mr-1" />
                                  <span>{proposal.finder?.rating || 4.8}</span>
                                </div>
                                <span>•</span>
                                <span>{proposal.finder?.completedJobs || 0} completed</span>
                              </div>
                            </div>
                          </div>

                          <Badge 
                            variant="outline"
                            className={proposal.status === 'pending' 
                              ? 'border-amber-200 text-amber-700'
                              : proposal.status === 'accepted'
                              ? 'border-green-200 text-green-700'
                              : 'border-slate-200 text-slate-700'
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Proposal Amount</p>
                            <p className="font-semibold text-green-600">
                              ₦{parseFloat(proposal.price || "0").toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Delivery Time</p>
                            <p className="font-semibold text-blue-600">
                              {proposal.timeline || proposal.deliveryTime || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            onClick={() => navigate(`/client/proposals/${proposal.id}`)}
                            variant="outline" 
                            size="sm"
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>

                          {proposal.status === 'pending' && (
                            <Button 
                              onClick={() => acceptProposal.mutate(proposal.id)}
                              disabled={acceptProposal.isPending}
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              {acceptProposal.isPending ? (
                                <>
                                  <Loader2 className="animate-spin w-4 h-4 mr-1" />
                                  Accepting...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Accept
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {proposals.length > 3 && (
                      <div className="text-center pt-4">
                        <Button 
                          onClick={() => navigate(`/client/proposals?findId=${findId}`)}
                          variant="outline" 
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          View {proposals.length - 3} More Proposals
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate("/client/proposals")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View All Proposals
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-slate-200 hover:bg-slate-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Find
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Find Stats */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Find Performance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Proposals</span>
                    <span className="font-semibold text-slate-900">{proposals.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Response Rate</span>
                    <span className="font-semibold text-green-600">
                      {proposals.length > 0 ? Math.round((proposals.length / 127) * 100) : 0}%
                    </span>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {proposals.length > 0 ? Math.round(proposals.reduce((sum, p) => sum + parseInt(p.price || "0"), 0) / proposals.length) : 0}
                    </div>
                    <div className="text-xs text-slate-600">Average Proposal Amount (₦)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Pro Tip</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Respond to proposals quickly to keep finders engaged and improve your response rate.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => navigate("/support/help-center")}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}