import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Handshake, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";
import type { User, Request, Proposal } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<Request[]>({
    queryKey: ['/api/admin/requests'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/admin/proposals'],
    enabled: !!user && user.role === 'admin'
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (usersLoading || requestsLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const clientCount = users.filter(u => u.role === 'client').length;
  const finderCount = users.filter(u => u.role === 'finder').length;
  const totalRequests = requests.length;
  const openRequests = requests.filter(r => r.status === 'open').length;
  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister Admin</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <span className="bg-white text-red-600 px-3 py-1 rounded font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the FinderMeister platform.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              <p className="text-gray-600 text-sm">{clientCount} clients, {finderCount} finders</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Requests</h3>
              <p className="text-2xl font-bold text-green-600">{totalRequests}</p>
              <p className="text-gray-600 text-sm">{openRequests} currently open</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Proposals</h3>
              <p className="text-2xl font-bold text-purple-600">{totalProposals}</p>
              <p className="text-gray-600 text-sm">{pendingProposals} pending review</p>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6 text-center">
              <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Issues</h3>
              <p className="text-2xl font-bold text-red-600">0</p>
              <p className="text-gray-600 text-sm">Reported issues</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Recent Users</CardTitle>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">Manage All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users registered yet.</p>
                </div>
              ) : (
                users.slice(-5).reverse().map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h4>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'finder' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">Recent Requests</CardTitle>
              <Link href="/admin/requests">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No requests submitted yet.</p>
                </div>
              ) : (
                requests.slice(-5).reverse().map((request: Request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        request.status === 'open' ? 'bg-green-100 text-green-700' :
                        request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{request.description.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Budget: ${request.budgetMin} - ${request.budgetMax}</span>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/requests">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Monitor Requests
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Platform Settings
                </Button>
              </Link>
              <Link href="/admin/withdrawals">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Withdrawals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}