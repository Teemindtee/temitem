import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Search, DollarSign, Clock, Trophy, Plus } from "lucide-react";
import type { Request, Proposal, User } from "@shared/schema";

export default function FinderDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableRequests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ['/api/finder/requests'],
    enabled: !!user
  });

  const { data: myProposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/finder/proposals'],
    enabled: !!user
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (requestsLoading || proposalsLoading) {
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
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <span className="bg-white text-red-600 px-3 py-1 rounded font-medium">Dashboard</span>
            <Link href="/finder/browse-requests" className="hover:underline">Browse Requests</Link>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-600"
            >
              Log Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Find opportunities and grow your finder business.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Earnings</h3>
              <p className="text-2xl font-bold text-green-600">$0</p>
              <p className="text-gray-600 text-sm">This month</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Active Projects</h3>
              <p className="text-2xl font-bold text-blue-600">{myProposals.filter(p => p.status === 'accepted').length}</p>
              <p className="text-gray-600 text-sm">In progress</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Completed Jobs</h3>
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-gray-600 text-sm">All time</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 hover:border-red-400 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Proposal</h3>
              <p className="text-gray-600 mb-4 text-sm">Find new opportunities</p>
              <Link href="/finder/browse-requests">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Browse Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">New Requests</CardTitle>
              <Link href="/finder/browse-requests">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No new requests available.</p>
                  <p className="text-sm">Check back soon for new opportunities!</p>
                </div>
              ) : (
                availableRequests.slice(0, 3).map((request: Request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full font-medium">
                        New
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{request.description.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Budget: ${request.budgetMin} - ${request.budgetMax}</span>
                      <Link href={`/finder/requests/${request.id}`}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* My Proposals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">My Proposals</CardTitle>
              <Link href="/finder/proposals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {myProposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No proposals submitted yet.</p>
                  <Link href="/finder/browse-requests" className="text-red-600 hover:underline font-medium">
                    Browse requests to get started
                  </Link>
                </div>
              ) : (
                myProposals.slice(0, 3).map((proposal: any) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Proposal #{proposal.id.substring(0, 8)}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{proposal.approach?.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">${proposal.price}</span>
                      <Link href={`/finder/proposals/${proposal.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}