import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { 
  Clock, 
  CheckCircle, 

  MessageCircle, 
  FileText, 
  TrendingUp, 
  Shield, 
  Star, 
  ArrowRight,
  Calendar,
  User,
  Briefcase,
  Award,
  Eye
} from "lucide-react";
import ClientHeader from "@/components/client-header";
import StartConversationButton from "@/components/StartConversationButton";

interface Contract {
  id: string;
  requestId: string;
  finderId: string;
  proposalId: string;
  amount: string;
  escrowStatus: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  hasSubmission?: boolean;
  request?: {
    title: string;
    description: string;
  };
  finder?: {
    name: string;
    rating?: string;
  };
}

export default function ClientContracts() {
  const { user } = useAuth();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['/api/client/contracts'],
    enabled: !!user,
  }) as { data: Contract[], isLoading: boolean };

  // Format currency in Naira
  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return '₦0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  // Calculate stats
  const activeContracts = contracts.filter(c => !c.isCompleted).length;
  const completedContracts = contracts.filter(c => c.isCompleted).length;
  const totalSpent = contracts
    .filter(c => c.isCompleted)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  // Helper functions for contract status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'funded':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'disputed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Funding';
      case 'funded':
        return 'Funded';
      case 'completed':
        return 'Completed';
      case 'disputed':
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -z-10" style={{ backgroundColor: "hsl(1, 81%, 63%)" }} />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 -z-10" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -z-10" style={{ backgroundColor: "hsl(1, 81%, 73%)" }} />

      <ClientHeader currentPage="contracts" />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent mb-4" style={{ backgroundImage: "linear-gradient(to right, hsl(213, 27%, 16%), hsl(1, 81%, 53%))" }}>
                Active Contracts
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Manage your ongoing projects and track completed work with talented finders
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{activeContracts}</div>
                  <div className="text-sm text-slate-600 font-medium">Active Contracts</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(147, 78%, 42%), hsl(159, 100%, 36%))" }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{completedContracts}</div>
                  <div className="text-sm text-slate-600 font-medium">Completed Finds</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(42, 92%, 56%), hsl(45, 100%, 51%))" }}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(totalSpent)}</div>
                  <div className="text-sm text-slate-600 font-medium">Total Invested</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <div>
                          <div className="h-5 bg-slate-200 rounded w-40 mb-2"></div>
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-slate-200 rounded w-20"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="flex gap-3">
                      <div className="h-9 bg-slate-200 rounded w-24"></div>
                      <div className="h-9 bg-slate-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(210, 20%, 95%), hsl(1, 81%, 95%))" }}>
                  <Briefcase className="w-12 h-12" style={{ color: "hsl(1, 81%, 53%)" }} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Start Your First Contract?</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                  Post a find request and connect with talented finders to get your projects completed professionally.
                </p>
                <div className="space-y-4">
                  <Link href="/client/create-find">
                    <Button 
                      size="lg" 
                      className="text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4"
                      style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Post Your First Find
                    </Button>
                  </Link>
                  <div className="text-sm text-slate-500">
                    Or <Link href="/client/browse-finds" className="text-finder-red hover:underline">browse existing finds</Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {contracts.map((contract) => (
                <Card key={contract.id} className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                          <AvatarFallback className="text-white font-bold" style={{ background: "linear-gradient(to bottom right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                            {(contract.finder?.name || "F")
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-finder-red transition-colors">
                            {contract.request?.title || "Contract"}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`${contract.isCompleted 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                              } border shadow-sm`}
                            >
                              {contract.isCompleted ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: "hsl(1, 81%, 53%)" }}>
                          {formatCurrency(contract.amount)}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {contract.isCompleted && contract.completedAt ? 
                            `Completed ${new Date(contract.completedAt).toLocaleDateString()}` :
                            `Started ${new Date(contract.createdAt).toLocaleDateString()}`
                          }
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-slate-600 bg-slate-50/80 rounded-lg p-3">
                      <User className="w-4 h-4 mr-2" style={{ color: "hsl(1, 81%, 53%)" }} />
                      <span className="font-medium">Working with {contract.finder?.name || "Finder"}</span>
                      {contract.finder?.rating && (
                        <div className="flex items-center ml-2 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium ml-1">
                            {parseFloat(contract.finder.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                      {contract.request?.description}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <StartConversationButton 
                        proposalId={contract.proposalId}
                        finderName={contract.finder?.name || "Finder"}
                        variant="outline"
                        className="flex-1 hover:bg-finder-red hover:text-white hover:border-finder-red transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Finder
                      </StartConversationButton>

                      {!contract.isCompleted && !contract.hasSubmission && (
                        <Link href={`/client/contracts/${contract.id}`}>
                          <Button 
                            size="sm" 
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </Link>
                      )}

                      {!contract.isCompleted && contract.hasSubmission && (
                        <Link href={`/orders/review/${contract.id}`}>
                          <Button 
                            size="sm" 
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Review Work
                          </Button>
                        </Link>
                      )}

                      {contract.isCompleted && (
                        <Link href={`/orders/review/${contract.id}`}>
                          <Button size="sm" variant="secondary" className="shadow-lg hover:shadow-xl transition-all">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      )}

                      {/* Payment Button for pending contracts */}
                      {!contract.isCompleted && contract.escrowStatus === 'pending' && (
                        <Link href={`/client/fund-contract/${contract.id}`}>
                          <Button
                            size="sm"
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Fund Contract
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}