import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import { 
  TrendingUp, 
  Shield, 
  Search,
  Clock,
  DollarSign,
  Eye,
  MoreVertical,
  MessageCircle,
  Flag
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Request } from "@shared/schema";
import { useState } from "react";

export default function AdminRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ['/api/admin/requests'],
    enabled: !!user && user.role === 'admin'
  });

  // Filter requests based on search term
  const filteredRequests = requests.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (request.status && request.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading requests...</p>
        </div>
      </div>
    );
  }

  const totalRequests = requests.length;
  const openRequests = requests.filter(r => r.status === 'open').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="requests" />
      
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Request Management</h1>
            <p className="text-gray-600">Monitor and manage all service requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-blue-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Total</h3>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{totalRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-green-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Open</h3>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{openRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-yellow-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">In Progress</h3>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{inProgressRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-purple-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Completed</h3>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{completedRequests}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Requests ({filteredRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search criteria." : "No requests have been submitted yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request: Request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="p-4 sm:p-6">
                      {/* Mobile Layout */}
                      <div className="block lg:hidden space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-base font-semibold text-gray-900 flex-1 pr-2">{request.title}</h3>
                          <Badge variant={
                            request.status === 'open' ? 'default' :
                            request.status === 'in_progress' ? 'secondary' :
                            request.status === 'completed' ? 'default' :
                            'outline'
                          } className="text-xs">
                            {request.status || 'Unknown'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{request.description}</p>
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>${request.budgetMin} - ${request.budgetMax}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{request.timeframe || 'No timeframe'}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {request.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/requests/${request.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/requests/${request.id}/proposals`}>
                                  View Proposals
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Contact Client", description: "Feature coming soon" })}>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Client
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => toast({ title: "Flag Request", description: "Feature coming soon" })}>
                                <Flag className="w-4 h-4 mr-2" />
                                Flag Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            <Badge variant={
                              request.status === 'open' ? 'default' :
                              request.status === 'in_progress' ? 'secondary' :
                              request.status === 'completed' ? 'default' :
                              'outline'
                            }>
                              {request.status || 'Unknown'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>Budget: ${request.budgetMin} - ${request.budgetMax}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{request.timeframe || 'No timeframe specified'}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {request.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-sm text-gray-500">
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/requests/${request.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/requests/${request.id}/proposals`}>
                                  View Proposals
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Contact Client", description: "Feature coming soon" })}>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Client
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => toast({ title: "Flag Request", description: "Feature coming soon" })}>
                                <Flag className="w-4 h-4 mr-2" />
                                Flag Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}