import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Calendar } from "lucide-react";
import ClientHeader from "@/components/client-header";
import type { Find, Proposal } from "@shared/schema";
import { useTranslation } from "react-i18next";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Format currency in Naira
  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return '₦0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₦${Math.round(numAmount / 100)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const { data: requests = [], isLoading: requestsLoading } = useQuery<Find[]>({
    queryKey: ['/api/client/finds'],
    enabled: !!user && user.role === 'client'
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/client/proposals'],
    enabled: !!user && user.role === 'client'
  });

  // Check if user is a client, redirect if not
  if (user && user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('common.access_denied')}</h1>
          <p className="text-gray-600 mb-4">{t('common.client_only_page')}</p>
          <Link href="/finder/dashboard">
            <Button>{t('navigation.finder_dashboard')}</Button>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="dashboard" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Finds</h1>
            <p className="text-gray-600">Manage your posted finds and track their progress</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link href="/client/create-find">
              <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                <Plus className="w-4 h-4 mr-2" />
                Post New Find
              </Button>
            </Link>
            <Link href="/client/proposals">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                View Proposals
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button className="px-4 py-2 text-sm font-medium text-white bg-finder-red rounded-md">
              Open Requests
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <Card>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No finds posted yet</h3>
                <p className="text-gray-600 mb-6">Start by posting your first find to connect with talented finders</p>
                <Link href="/client/create-find">
                  <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Find
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden lg:block bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-2">Budget</div>
                    <div className="col-span-2">Posted</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-200">
                  {requests.map((request: Find) => (
                    <div key={request.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                      {/* Desktop Layout */}
                      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                        {/* Title Column */}
                        <div className="col-span-5">
                          <h3 className="font-medium text-gray-900 mb-1">{request.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {request.description}
                          </p>
                        </div>

                        {/* Budget Column */}
                        <div className="col-span-2">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                          </div>
                        </div>

                        {/* Posted Column */}
                        <div className="col-span-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(request.createdAt || '')}
                          </div>
                        </div>

                        {/* Status Column */}
                        <div className="col-span-2">
                          <Badge 
                            variant={
                              (request.status === 'active' || request.status === 'open') ? 'default' :
                              request.status === 'in_progress' ? 'secondary' :
                              request.status === 'completed' ? 'outline' :
                              'destructive'
                            }
                            className={
                              (request.status === 'active' || request.status === 'open') ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                              request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                              request.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              'bg-red-100 text-red-700 hover:bg-red-200'
                            }
                          >
                            {request.status === 'active' || request.status === 'open' ? 'Open' : 
                             request.status === 'in_progress' ? 'In Progress' :
                             request.status === 'completed' ? 'Completed' :
                             request.status?.replace('_', ' ') || 'Pending'}
                          </Badge>
                        </div>

                        {/* Action Column */}
                        <div className="col-span-1">
                          <Link href={`/client/finds/${request.id}`}>
                            <Button size="sm" variant="ghost" className="text-finder-red hover:text-finder-red-dark hover:bg-finder-red/10">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Mobile/Tablet Layout */}
                      <div className="lg:hidden space-y-3">
                        {/* Title and Action Row */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{request.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Link href={`/client/finds/${request.id}`}>
                              <Button size="sm" variant="ghost" className="text-finder-red hover:text-finder-red-dark hover:bg-finder-red/10 px-2 sm:px-3">
                                <span className="hidden sm:inline">View</span>
                                <span className="sm:hidden text-xs">View</span>
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Details Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          {/* Budget */}
                          <div>
                            <span className="text-gray-500 font-medium">Budget: </span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                            </span>
                          </div>

                          {/* Posted Date */}
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500" />
                            <span className="text-gray-600">{formatDate(request.createdAt || '')}</span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center">
                            <Badge 
                              variant={
                                (request.status === 'active' || request.status === 'open') ? 'default' :
                                request.status === 'in_progress' ? 'secondary' :
                                request.status === 'completed' ? 'outline' :
                                'destructive'
                              }
                              className={`text-xs ${
                                (request.status === 'active' || request.status === 'open') ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                request.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {request.status === 'active' || request.status === 'open' ? 'Open' : 
                               request.status === 'in_progress' ? 'In Progress' :
                               request.status === 'completed' ? 'Completed' :
                               request.status?.replace('_', ' ') || 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {requests.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {requests.filter((r: Find) => r.status === 'open' || r.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Open Finds</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {requests.filter((r: Find) => r.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {requests.filter((r: Find) => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {proposals.length}
                </div>
                <div className="text-sm text-gray-600">Total Proposals</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}