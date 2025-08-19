import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import AdminHeader from "@/components/admin-header";
import { 
  Users, 
  FileText, 
  Star, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Eye,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  XCircle,
  Play,
  Clock,
  ArrowRight,
  BarChart3
} from "lucide-react";
import type { Find, User as UserType, Proposal } from "@shared/schema";
import { Link } from "wouter";

interface FindWithClient extends Find {
  client?: UserType;
}

interface DashboardStats {
  totalUsers: number;
  totalFinds: number;
  totalProposals: number;
  activeFinds: number;
  completedFinds: number;
  totalRevenue: string;
}

export default function AdminDashboardModern() {
  const { user } = useAuth();

  // Fetch all data
  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: finds = [], isLoading: findsLoading } = useQuery<FindWithClient[]>({
    queryKey: ['/api/admin/finds'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/admin/proposals'],
    enabled: !!user && user.role === 'admin'
  });

  const isLoading = usersLoading || findsLoading || proposalsLoading;

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalUsers: users.length,
    totalFinds: finds.length,
    totalProposals: proposals.length,
    activeFinds: finds.filter(f => f.status === 'open' || f.status === 'in_progress').length,
    completedFinds: finds.filter(f => f.status === 'completed').length,
    totalRevenue: "₦2,450,000" // This would come from actual revenue calculations
  };

  // Get recent finds and users for the bottom tables
  const recentFinds = finds
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return '₦0';
    return `₦${parseFloat(amount.toString()).toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle2 className="w-3 h-3" />;
      case 'in_progress': return <Play className="w-3 h-3" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'finder': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AdminHeader currentPage="dashboard" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="dashboard" />
      
      {/* Modern Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-60"></div>
              <div className="relative p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg font-medium">
                Welcome back, {user?.firstName}! Here's your platform overview
              </p>
            </div>
          </div>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-600 font-medium">+12.5%</span>
                  <span className="text-xs sm:text-sm text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Total Finds</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalFinds}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500/10 text-green-600 rounded-xl">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-600 font-medium">+8.2%</span>
                  <span className="text-xs sm:text-sm text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Proposals</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProposals}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-500/10 text-purple-600 rounded-xl">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-600 font-medium">+15.3%</span>
                  <span className="text-xs sm:text-sm text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-teal-500/10 text-teal-600 rounded-xl">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-600 font-medium">+18.9%</span>
                  <span className="text-xs sm:text-sm text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Recent Finds Table */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Find Requests</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Latest service requests posted on the platform</p>
              </div>
              <Link href="/admin/requests">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-xs sm:text-sm">
                  View All
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Client & Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Budget & Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {recentFinds.map((find) => (
                    <tr key={find.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {find.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {find.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {find.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
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
                      
                      <td className="px-4 py-4">
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
                      
                      <td className="px-4 py-4">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(find.status || '')}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(find.status || '')}
                            {(find.status?.replace('_', ' ')?.charAt(0)?.toUpperCase() || '') + (find.status?.replace('_', ' ')?.slice(1) || '') || 'Unknown'}
                          </div>
                        </Badge>
                      </td>
                      
                      <td className="px-4 py-4 text-right">
                        <Button variant="outline" size="sm" className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-lg">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {recentFinds.map((find) => (
                <div key={find.id} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                      {find.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {find.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {find.description}
                      </p>
                    </div>
                    <Badge className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(find.status || '')}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(find.status || '')}
                        <span className="hidden sm:inline">{(find.status?.replace('_', ' ')?.charAt(0)?.toUpperCase() || '') + (find.status?.replace('_', ' ')?.slice(1) || '') || 'Unknown'}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User className="w-3 h-3" />
                        <span className="truncate">
                          {find.client ? `${find.client.firstName} ${find.client.lastName}` : 'Client ID: ' + find.clientId.substring(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Tag className="w-3 h-3" />
                        <span className="truncate">{find.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-right">
                      <div className="flex items-center justify-end gap-2 font-medium text-gray-900 dark:text-white">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(find.budgetMin || find.budgetMax || '0')}
                      </div>
                      <div className="flex items-center justify-end gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {find.createdAt ? new Date(find.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-lg">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users Table */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Users</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Latest users who joined the platform</p>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-xs sm:text-sm">
                  View All
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {recentUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {userData.firstName?.charAt(0) || ''}{userData.lastName?.charAt(0) || ''}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {userData.firstName} {userData.lastName}
                            </h3>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {userData.email}
                        </div>
                        {userData.phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {userData.phone}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(userData.role)}`}>
                            {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {userData.isVerified && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 rounded-full text-xs">
                              Verified
                            </Badge>
                          )}
                          {userData.isBanned && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 px-2 py-1 rounded-full text-xs">
                              Banned
                            </Badge>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-right">
                        <Button variant="outline" size="sm" className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-lg">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {recentUsers.map((userData) => (
                <div key={userData.id} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                        {userData.firstName?.charAt(0) || ''}{userData.lastName?.charAt(0) || ''}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {userData.firstName} {userData.lastName}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {userData.email}
                        </p>
                        {userData.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {userData.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-lg flex-shrink-0">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(userData.role)}`}>
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </Badge>
                      {userData.isVerified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 rounded-full text-xs">
                          Verified
                        </Badge>
                      )}
                      {userData.isBanned && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 px-2 py-1 rounded-full text-xs">
                          Banned
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}