import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/ui/navigation";
import MobileNav from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/lib/auth";
import { NotebookPen, TrendingUp, DollarSign, Star, Search, Coins, User, MessageSquare } from "lucide-react";

export default function FinderDashboard() {
  const { user, profile, isAuthenticated } = useAuth();

  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ['/api/proposals/my'],
    queryFn: () => fetch('/api/proposals/my', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated && user?.role === 'finder',
  });

  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts/my'],
    queryFn: () => fetch('/api/contracts/my', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated && user?.role === 'finder',
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ['/api/tokens/balance'],
    queryFn: () => fetch('/api/tokens/balance', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated && user?.role === 'finder',
  });

  if (!isAuthenticated || user?.role !== 'finder') {
    return <div>Access denied</div>;
  }

  const activeProposals = proposals?.filter((p: any) => p.status === 'pending') || [];
  const acceptedProposals = proposals?.filter((p: any) => p.status === 'accepted') || [];
  const completedContracts = contracts?.filter((c: any) => c.isCompleted) || [];
  
  const successRate = proposals?.length > 0 ? 
    (acceptedProposals.length / proposals.length * 100).toFixed(0) : 0;

  const monthlyEarnings = completedContracts
    ?.filter((c: any) => {
      const contractDate = new Date(c.completedAt);
      const now = new Date();
      return contractDate.getMonth() === now.getMonth() && contractDate.getFullYear() === now.getFullYear();
    })
    ?.reduce((sum: number, contract: any) => sum + parseFloat(contract.amount || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-finder-gray">
      <Navigation />

      {/* Header */}
      <div className="bg-finder-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-white">
                <AvatarFallback className="bg-white text-finder-red text-lg font-bold">
                  {getInitials(user?.firstName || '', user?.lastName || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-red-100">
                    {profile?.averageRating || '0.0'} • {profile?.jobsCompleted || 0} Completed Finds
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-red-100">Available Tokens</p>
                <p className="text-2xl font-bold">{tokenBalance?.balance || 0}</p>
              </div>
              <Button className="bg-white text-finder-red hover:bg-red-50 font-medium">
                Buy Tokens
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-4 grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Active Proposals</p>
                    <p className="text-3xl font-bold text-finder-text">{activeProposals.length}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <NotebookPen className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Success Rate</p>
                    <p className="text-3xl font-bold text-finder-text">{successRate}%</p>
                  </div>
                  <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">This Month</p>
                    <p className="text-3xl font-bold text-finder-text">${monthlyEarnings.toFixed(2)}</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Average Rating</p>
                    <p className="text-3xl font-bold text-finder-text">
                      {profile?.averageRating || '0.0'}
                    </p>
                  </div>
                  <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Proposals */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-finder-text mb-6">Your Recent Proposals</h2>
            <div className="space-y-4">
              {proposalsLoading ? (
                <div>Loading your proposals...</div>
              ) : proposals && proposals.length > 0 ? (
                proposals.slice(0, 5).map((proposal: any) => (
                  <Card key={proposal.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-finder-text">
                          Proposal for Request #{proposal.requestId.slice(-8)}
                        </h3>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-finder-text-light mb-4">
                        {proposal.approach}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-finder-text-light">
                            Your bid: <span className="font-semibold text-finder-text">
                              ${proposal.price}
                            </span>
                          </span>
                          <span className="text-sm text-finder-text-light">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="text-finder-red border-finder-red hover:bg-red-50">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-finder-text-light mb-4">
                      You haven't submitted any proposals yet.
                    </p>
                    <Link href="/finder/browse-requests">
                      <Button className="bg-finder-red hover:bg-finder-red-dark">
                        Browse Available Requests
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-finder-text mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/finder/browse-requests">
                <Button className="w-full bg-finder-red text-white hover:bg-finder-red-dark font-semibold p-4 h-auto">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Requests
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full border-finder-red text-finder-red hover:bg-red-50 font-semibold p-4 h-auto">
                <Coins className="w-5 h-5 mr-2" />
                Buy Tokens
              </Button>
              
              <Button variant="outline" className="w-full font-semibold p-4 h-auto">
                <User className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
              
              <Button variant="outline" className="w-full font-semibold p-4 h-auto">
                <MessageSquare className="w-5 h-5 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
