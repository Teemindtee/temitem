import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import { 
  Search,
  Clock,
  DollarSign,
  Eye,
  MoreVertical,
  FileText,
  CheckCircle2,
  XCircle,
  Play,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminIssueStrike from "@/components/admin-issue-strike";
import type { Find, User as UserType } from "@shared/schema";

interface FindWithClient extends Find {
  client?: UserType;
}
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminRequestsModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: finds = [], isLoading } = useQuery<FindWithClient[]>({
    queryKey: ['/api/admin/finds'],
    enabled: !!user && user.role === 'admin'
  });

  // Filter finds based on search and status
  const filteredFinds = finds.filter(find => {
    const matchesSearch = 
      find.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      find.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      find.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || find.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredFinds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFinds = filteredFinds.slice(startIndex, startIndex + itemsPerPage);

  // Update mutation for find status
  const updateFindStatusMutation = useMutation({
    mutationFn: async ({ findId, status }: { findId: string; status: string }) => {
      return await apiRequest(`/api/admin/finds/${findId}/status`, { 
        method: "PUT", 
        body: JSON.stringify({ status }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/finds'] });
      toast({ title: "Success", description: "Find status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update find status", variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle2 className="w-3 h-3" />;
      case 'in_progress': return <Play className="w-3 h-3" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'under_review': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return '₦0';
    return `₦${parseFloat(amount.toString()).toLocaleString()}`;
  };

  const handleStatusChange = (findId: string, newStatus: string) => {
    updateFindStatusMutation.mutate({ findId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AdminHeader currentPage="finds" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading finds...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: finds.length,
    open: finds.filter(f => f.status === 'open').length,
    inProgress: finds.filter(f => f.status === 'in_progress').length,
    completed: finds.filter(f => f.status === 'completed').length,
    cancelled: finds.filter(f => f.status === 'cancelled').length,
    underReview: finds.filter(f => f.status === 'under_review').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="finds" />
      
      {/* Modern Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-60"></div>
                <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                  <FileText className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Find Requests
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor and manage service requests</p>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.open}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.cancelled}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Under Review</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.underReview}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search finds by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-10 bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10 bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Modern Table */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Find Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Client & Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Budget & Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {paginatedFinds.map((find) => (
                  <tr key={find.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {find.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {find.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {find.description}
                          </p>
                          {find.flaggedWords && find.flaggedWords.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {find.flaggedWords.map((word, index) => (
                                <Badge key={index} className="px-2 py-0.5 text-xs bg-red-100 text-red-800 border-red-200">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {find.reviewReason && (
                            <p className="text-xs text-orange-600 mt-1 font-medium">
                              {find.reviewReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          <span className="truncate">
                            {find.client ? `${find.client.firstName} ${find.client.lastName}` : 'Client ID: ' + find.clientId.substring(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Tag className="w-3 h-3" />
                          <span className="truncate">{find.category || 'Uncategorized'}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(find.budgetMin || find.budgetMax || '0')}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {find.createdAt ? new Date(find.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(find.status || '')}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(find.status || '')}
                          {find.status?.replace('_', ' ').charAt(0).toUpperCase() + find.status?.replace('_', ' ').slice(1) || 'Unknown'}
                        </div>
                      </Badge>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-lg transition-colors duration-150"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg">
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(find.id, 'open')} 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              disabled={find.status === 'open'}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Open
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(find.id, 'in_progress')} 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              disabled={find.status === 'in_progress'}
                            >
                              <Play className="w-3 h-3" />
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(find.id, 'completed')} 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              disabled={find.status === 'completed'}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(find.id, 'cancelled')} 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={find.status === 'cancelled'}
                            >
                              <XCircle className="w-3 h-3" />
                              Mark Cancelled
                            </DropdownMenuItem>
                            
                            {find.status === 'under_review' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(find.id, 'open')} 
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve & Publish
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(find.id, 'cancelled')} 
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject Find
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {find.client && (
                              <DropdownMenuItem asChild>
                                <div className="p-0">
                                  <AdminIssueStrike
                                    userId={find.clientId}
                                    userRole="client"
                                    userName={`${find.client.firstName} ${find.client.lastName}`}
                                    contextId={find.id}
                                    contextType="find"
                                    trigger={
                                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 w-full text-left">
                                        <AlertTriangle className="w-3 h-3" />
                                        Issue Strike
                                      </button>
                                    }
                                    onStrikeIssued={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/finds'] })}
                                  />
                                </div>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFinds.length)} of {filteredFinds.length} results
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentPage === page 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {filteredFinds.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No finds found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}