import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinderHeader } from "@/components/finder-header";
import { SupportWidget } from "@/components/support-widget";
import { useAuth } from "@/hooks/use-auth";
import { Search, DollarSign, Clock, Trophy, Plus, Coins } from "lucide-react";
import type { Request, Proposal, User } from "@shared/schema";

export default function FinderDashboard() {
  const { user } = useAuth();

  const { data: availableRequests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ['/api/finder/requests'],
    enabled: !!user
  });

  const { data: myProposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/finder/proposals'],
    enabled: !!user
  });

  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  if (requestsLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="dashboard" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName || 'Finder'}!</h1>
          <p className="text-gray-600 text-sm sm:text-base">Find opportunities and grow your finder business.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-green-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-green-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Total Earnings</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">${(finder as any)?.totalEarnings || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">All time</p>
            </CardContent>
          </Card>

          <Link href="/finder/contracts">
            <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="bg-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Active Projects</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{myProposals.filter(p => p.status === 'accepted').length}</p>
                <p className="text-gray-600 text-xs sm:text-sm">In progress</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-purple-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Completed Jobs</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{(finder as any)?.completedJobs || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">All time</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-orange-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Token Balance</h3>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{(finder as any)?.tokenBalance || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Available</p>
            </CardContent>
          </Card>

          <Card className="border-finder-red/30 hover:border-finder-red/60 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-finder-red rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Proposal</h3>
              <p className="text-gray-600 mb-4 text-sm">Find new opportunities</p>
              <Link href="/finder/browse-requests">
                <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
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
                        <Button size="sm" className="bg-finder-red hover:bg-finder-red-dark">View</Button>
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
                  <Link href="/finder/browse-requests" className="text-finder-red hover:underline font-medium">
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
                        'bg-finder-red/20 text-finder-red-dark'
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
      <SupportWidget context="dashboard" />
    </div>
  );
}