import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, CheckCircle, Search, User as UserIcon, FileText, Eye, Cog, ChevronRight, FileEdit } from "lucide-react";
import ClientHeader from "@/components/client-header";
import { apiRequest } from "@/lib/queryClient";
import type { Request, Proposal, User } from "@shared/schema";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if mobile view is needed
  const isMobile = window.innerWidth < 640;

  const { data: requests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ['/api/client/requests'],
    enabled: !!user
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/client/proposals'],
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

  // Mobile Dashboard Layout
  if (isMobile) {
    const userName = user ? `${user.firstName} ${user.lastName}` : "User";

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-First Layout */}
        <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
          {/* Header with User Info */}
          <div className="bg-red-600 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 font-bold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xl font-semibold text-white">{userName.split(' ')[0]}</span>
            </div>
            <ChevronRight className="h-6 w-6 text-white" />
          </div>

          {/* Dashboard Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Post a Request */}
              <Link href="/client/create-request">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                      <FileEdit className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">
                      Post a<br />Request
                    </span>
                  </CardContent>
                </Card>
              </Link>

              {/* View Proposals */}
              <Link href="/client/proposals">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                      <Eye className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">
                      View<br />Proposals
                    </span>
                  </CardContent>
                </Card>
              </Link>

              {/* My Contracts */}
              <Link href="/client/browse-requests">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">
                      My<br />Contracts
                    </span>
                  </CardContent>
                </Card>
              </Link>

              {/* Settings */}
              <Link href="/client/profile">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                      <Cog className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">
                      Settings
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Bottom Tagline */}
            <div className="text-center mt-16">
              <p className="text-gray-500 text-base font-medium">
                One successful find<br />
                at a time
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="dashboard" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Manage your requests and find the perfect finder.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-red-200 hover:border-red-400 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Post New Request</h3>
              <p className="text-gray-600 mb-4 text-sm">Need help finding something? Create a new request.</p>
              <Link href="/client/create-request">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Create Request
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Active Requests</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">{requests.filter((r: Request) => r.status === 'open').length}</p>
              <p className="text-gray-600 text-sm">Requests waiting for proposals</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Completed</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">{requests.filter((r: Request) => r.status === 'completed').length}</p>
              <p className="text-gray-600 text-sm">Successfully completed requests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Your Recent Requests</CardTitle>
              <Link href="/client/requests">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>You haven't created any requests yet.</p>
                  <Link href="/client/create-request" className="text-red-600 hover:underline font-medium">
                    Create your first request
                  </Link>
                </div>
              ) : (
                requests.slice(0, 3).map((request: Request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        request.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.status === 'active' ? 'Active' : request.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{request.description.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Budget: ${request.budgetMin} - ${request.budgetMax}</span>
                      <Link href={`/client/requests/${request.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Proposals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Recent Proposals</CardTitle>
              <Link href="/client/proposals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No proposals received yet.</p>
                  <p className="text-sm">Create a request to get started!</p>
                </div>
              ) : (
                proposals.slice(0, 3).map((proposal: any) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">Proposal for Request</h4>
                        <p className="text-sm text-gray-600">By Finder</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">${proposal.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{proposal.approach?.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">
                        Timeline: {proposal.timeline}
                      </span>
                      <Link href={`/client/proposals/${proposal.id}`}>
                        <Button size="sm" variant="outline">Review</Button>
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