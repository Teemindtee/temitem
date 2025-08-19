import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, CheckCircle, Search, User as UserIcon, FileText, Eye, Cog, ChevronRight, FileEdit, MessageCircle } from "lucide-react";
import ClientHeader from "@/components/client-header";
import { apiRequest } from "@/lib/queryClient";
import type { Find, Proposal, User } from "@shared/schema";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if mobile view is needed
  const isMobile = window.innerWidth < 640;

  const { data: requests = [], isLoading: requestsLoading } = useQuery<Find[]>({
    queryKey: ['/api/client/finds'],
    enabled: !!user && user.role === 'client'
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/client/proposals'],
    enabled: !!user && user.role === 'client'
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

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

  if (requestsLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Mobile Dashboard Layout - Match exact mockup design
  if (isMobile) {
    const userName = user?.firstName || "Tosin";

    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader currentPage="dashboard" />
        {/* Mobile Phone Frame */}
        <div className="max-w-sm mx-auto min-h-screen bg-white shadow-2xl border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header with User Profile */}
          <div className="bg-finder-red px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">👤</span>
                </div>
              </div>
              <span className="text-white text-xl font-semibold">{userName}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-white" />
          </div>

          {/* Main Content Area */}
          <div className="px-4 py-6 bg-white flex-1">
            {/* Action Grid - Exact 2x2 Layout */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              {/* Post a Request - Top Left */}
              <Link href="/client/create-find">
                <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-1 bg-white rounded mb-1"></div>
                      <div className="w-6 h-1 bg-white rounded mb-1"></div>
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <span className="text-finder-red text-xs font-bold">+</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-900 font-semibold text-sm leading-tight">Post a</div>
                    <div className="text-gray-900 font-semibold text-sm leading-tight">Find</div>
                  </div>
                </div>
              </Link>

              {/* View Proposals - Top Right */}
              <Link href="/client/proposals">
                <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center relative">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-900 font-semibold text-sm leading-tight">View</div>
                    <div className="text-gray-900 font-semibold text-sm leading-tight">Proposals</div>
                  </div>
                </div>
              </Link>

              {/* Contracts - Bottom Left */}
              <Link href="/client/contracts">
                <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    <div className="w-8 h-6 border-2 border-white rounded-lg flex flex-col justify-center items-center relative">
                      <div className="w-4 h-0.5 bg-white rounded mb-0.5"></div>
                      <div className="w-3 h-0.5 bg-white rounded mb-0.5"></div>
                      <div className="w-5 h-0.5 bg-white rounded"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-900 font-semibold text-sm leading-tight">Contracts</div>
                  </div>
                </div>
              </Link>

              {/* Settings - Bottom Right */}
              <Link href="/client/profile">
                <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute -top-1 w-1 h-3 bg-white rounded"></div>
                      <div className="absolute -right-1 w-3 h-1 bg-white rounded"></div>
                      <div className="absolute -bottom-1 w-1 h-3 bg-white rounded"></div>
                      <div className="absolute -left-1 w-3 h-1 bg-white rounded"></div>
                      <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full"></div>
                      <div className="absolute bottom-0 right-0 w-1 h-1 bg-white rounded-full"></div>
                      <div className="absolute bottom-0 left-0 w-1 h-1 bg-white rounded-full"></div>
                      <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-900 font-semibold text-sm leading-tight">Settings</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Bottom Tagline - Positioned at bottom */}
            <div className="absolute bottom-8 left-0 right-0">
              <div className="text-center px-4">
                <p className="text-gray-500 text-base font-medium leading-snug">
                  One successful find<br />
                  at a time
                </p>
              </div>
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
          <p className="text-gray-600">Manage your finds and find the perfect finder.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-finder-red/30 hover:border-finder-red/60 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-finder-red rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Post New Find</h3>
              <p className="text-gray-600 mb-4 text-sm">Need help finding something? Create a new find.</p>
              <Link href="/client/create-find">
                <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                  Create Find
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Active Find(s)</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">{requests.filter((r: Find) => r.status === 'open').length}</p>
              <p className="text-gray-600 text-sm">Finds waiting for proposals</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Completed Find(s)</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">{requests.filter((r: Find) => r.status === 'completed').length}</p>
              <p className="text-gray-600 text-sm">Successfully completed finds</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:border-purple-400 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600 mb-4 text-sm">Chat with finders who submitted proposals.</p>
              <Link href="/messages">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  View Messages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Your Recent Finds</CardTitle>
              <Link href="/client/finds">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>You haven't created any finds yet.</p>
                  <Link href="/client/create-find" className="text-finder-red hover:underline font-medium">
                    Create your first find
                  </Link>
                </div>
              ) : (
                requests.slice(0, 3).map((request: Find) => (
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
                      <Link href={`/client/finds/${request.id}`}>
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
                  <p className="text-sm">Create a find to get started!</p>
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