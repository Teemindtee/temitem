import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { Users, ClipboardList, DollarSign, PieChart, Ban, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => fetch('/api/admin/users', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to ban user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User banned successfully",
        description: "The user has been banned from the platform.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to ban user",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  const totalUsers = users?.length || 0;
  const clients = users?.filter((u: any) => u.role === 'client').length || 0;
  const finders = users?.filter((u: any) => u.role === 'finder').length || 0;
  const bannedUsers = users?.filter((u: any) => u.isBanned).length || 0;

  const handleBanUser = (userId: string) => {
    if (confirm('Are you sure you want to ban this user?')) {
      banUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'finder': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-finder-gray">
      <Navigation />

      {/* Header */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300">Manage users, requests, and platform settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Admin Stats */}
          <div className="lg:col-span-4 grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-finder-text">{totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Clients</p>
                    <p className="text-3xl font-bold text-finder-text">{clients}</p>
                  </div>
                  <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Finders</p>
                    <p className="text-3xl font-bold text-finder-text">{finders}</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-finder-text-light text-sm">Banned Users</p>
                    <p className="text-3xl font-bold text-finder-text">{bannedUsers}</p>
                  </div>
                  <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Ban className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-finder-text">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div>Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-finder-gray">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-finder-text-light uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-finder-text-light uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-finder-text-light uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-finder-text-light uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-finder-text-light uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users?.slice(0, 10).map((user: any) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-finder-text">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-finder-text-light">
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getRoleColor(user.role)}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                {user.isBanned ? 'Banned' : 'Active'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-finder-text-light">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {!user.isBanned && user.role !== 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleBanUser(user.id)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  disabled={banUserMutation.isPending}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Ban
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-finder-text">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 font-semibold p-4 h-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Manage Users
                </Button>
                
                <Button variant="outline" className="w-full border-gray-800 text-gray-800 hover:bg-gray-50 font-semibold p-4 h-auto">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Review Requests
                </Button>
                
                <Button variant="outline" className="w-full font-semibold p-4 h-auto">
                  <PieChart className="w-5 h-5 mr-2" />
                  Analytics
                </Button>
                
                <Button variant="outline" className="w-full font-semibold p-4 h-auto">
                  <Shield className="w-5 h-5 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
