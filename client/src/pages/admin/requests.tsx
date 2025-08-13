import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  TrendingUp, 
  Shield, 
  Search,
  Clock,
  DollarSign,
  Eye,
  MoreVertical
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
    request.status.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="text-white hover:bg-red-700 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xl font-bold">Request Management</span>
            </div>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Requests</h1>
            <p className="text-gray-600">Monitor and manage all service requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Requests</h3>
              <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Open</h3>
              <p className="text-2xl font-bold text-green-600">{openRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-600">{inProgressRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Completed</h3>
              <p className="text-2xl font-bold text-purple-600">{completedRequests}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests by title, description, category, or status..."
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
                  <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                          <Badge variant={
                            request.status === 'open' ? 'default' :
                            request.status === 'in_progress' ? 'secondary' :
                            request.status === 'completed' ? 'default' :
                            'outline'
                          }>
                            {request.status}
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
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Proposals</DropdownMenuItem>
                            <DropdownMenuItem>Contact Client</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Flag Request
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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