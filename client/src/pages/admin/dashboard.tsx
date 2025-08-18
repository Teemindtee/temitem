import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import AdminHeader from "@/components/admin-header";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Settings,
  Edit
} from "lucide-react";
import type { User, Find, Proposal } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: finds = [], isLoading: findsLoading } = useQuery<Find[]>({
    queryKey: ['/api/admin/finds'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/admin/proposals'],
    enabled: !!user && user.role === 'admin'
  });

  if (usersLoading || findsLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const clientCount = users.filter(u => u.role === 'client').length;
  const finderCount = users.filter(u => u.role === 'finder').length;
  const totalFinds = finds.length;
  const openFinds = finds.filter(f => f.status === 'open').length;
  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, manage your platform from here.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-blue-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Total Users</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalUsers}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{clientCount} clients, {finderCount} finders</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-green-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Total Finds</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{totalFinds}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{openFinds} currently open</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Total Proposals</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{totalProposals}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{pendingProposals} pending review</p>
            </CardContent>
          </Card>

          <Card className="border-finder-red/30">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-finder-red rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Issues</h3>
              <p className="text-xl sm:text-2xl font-bold text-finder-red">0</p>
              <p className="text-gray-600 text-xs sm:text-sm">Reported issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Link href="/admin/users">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Manage Users</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/requests">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">View Finds</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/withdrawals">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Withdrawals</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/blog-posts">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Edit className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Blog Posts</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/categories">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-teal-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Categories</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/settings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Settings</p>
                </CardContent>
              </Card>
            </Link>


          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg sm:text-xl text-gray-900">Recent Users</CardTitle>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">Manage All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No users registered yet.</p>
                </div>
              ) : (
                users.slice(-5).reverse().map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-finder-red/20 text-finder-red-dark' :
                        user.role === 'finder' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 ml-2">
                      {user.isVerified ? '✓ Verified' : 'Pending'}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Finds */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg sm:text-xl text-gray-900">Recent Finds</CardTitle>
              <Link href="/admin/requests">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {finds.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No finds submitted yet.</p>
                </div>
              ) : (
                finds.slice(-5).reverse().map((find: Find) => (
                  <div key={find.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{find.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">Budget: ${find.budgetMin} - ${find.budgetMax}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                        find.status === 'open' ? 'bg-green-100 text-green-700' :
                        find.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        find.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {find.status}
                      </span>
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