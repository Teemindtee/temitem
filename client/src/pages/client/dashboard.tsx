import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/ui/navigation";
import MobileNav from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/lib/auth";
import { Clock, Check, DollarSign, Plus, Search, MessageSquare, User } from "lucide-react";

export default function ClientDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/requests/my'],
    queryFn: () => fetch('/api/requests/my', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated && user?.role === 'client',
  });

  const { data: contracts } = useQuery({
    queryKey: ['/api/contracts/my'],
    queryFn: () => fetch('/api/contracts/my', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated && user?.role === 'client',
  });

  if (!isAuthenticated || user?.role !== 'client') {
    return <div>Access denied</div>;
  }

  const activeRequests = requests?.filter((r: any) => r.status === 'active') || [];
  const completedRequests = requests?.filter((r: any) => r.status === 'completed') || [];
  const totalSpent = contracts?.reduce((sum: number, contract: any) => 
    sum + parseFloat(contract.amount || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-finder-gray">
      <Navigation />

      {/* Header */}
      <div className="bg-finder-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-finder-red" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-red-100">Client Dashboard</p>
              </div>
            </div>
            <Link href="/client/post-request">
              <Button className="bg-white text-finder-red hover:bg-red-50 font-medium">
                Post New Request
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Active Requests</p>
                    <p className="text-3xl font-bold text-finder-text">{activeRequests.length}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Completed</p>
                    <p className="text-3xl font-bold text-finder-text">{completedRequests.length}</p>
                  </div>
                  <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Total Spent</p>
                    <p className="text-3xl font-bold text-finder-text">${totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-finder-text mb-6">Your Requests</h2>
            <div className="space-y-4">
              {requestsLoading ? (
                <div>Loading your requests...</div>
              ) : requests && requests.length > 0 ? (
                requests.map((request: any) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-finder-text">
                          {request.title}
                        </h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-finder-text-light mb-4">
                        {request.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-finder-text-light">
                            Budget: <span className="font-semibold text-finder-text">
                              ${request.budgetMin} - ${request.budgetMax}
                            </span>
                          </span>
                          <span className="text-sm text-finder-text-light">
                            Category: {request.category}
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
                      You haven't posted any requests yet.
                    </p>
                    <Link href="/client/post-request">
                      <Button className="bg-finder-red hover:bg-finder-red-dark">
                        Post Your First Request
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
              <Link href="/client/post-request">
                <Button className="w-full bg-finder-red text-white hover:bg-finder-red-dark font-semibold p-4 h-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Post New Request
                </Button>
              </Link>
              
              <Link href="/finder/browse-requests">
                <Button variant="outline" className="w-full border-finder-red text-finder-red hover:bg-red-50 font-semibold p-4 h-auto">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Finders
                </Button>
              </Link>
              
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
