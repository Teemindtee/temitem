import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import { 
  ArrowLeft,
  Users, 
  Shield, 
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  UserCheck,
  UserX
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [banReason, setBanReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'verify' | 'unverify' }) => {
      return await apiRequest('POST', `/api/admin/users/${userId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User verification status updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user verification",
        variant: "destructive"
      });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: 'ban' | 'unban'; reason?: string }) => {
      return await apiRequest('POST', `/api/admin/users/${userId}/${action}`, 
        action === 'ban' ? { reason } : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser(null);
      setBanReason("");
      toast({
        title: "Success",
        description: "User ban status updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user ban status",
        variant: "destructive"
      });
    }
  });

  const handleVerifyUser = (userId: string, shouldVerify: boolean) => {
    verifyUserMutation.mutate({
      userId,
      action: shouldVerify ? 'verify' : 'unverify'
    });
  };

  const handleBanUser = (userId: string, shouldBan: boolean) => {
    if (shouldBan) {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user || null);
    } else {
      banUserMutation.mutate({ userId, action: 'unban' });
    }
  };

  const confirmBanUser = () => {
    if (!selectedUser || !banReason.trim()) return;
    
    banUserMutation.mutate({
      userId: selectedUser.id,
      action: 'ban',
      reason: banReason
    });
  };

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin'
  });

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const clientCount = users.filter(u => u.role === 'client').length;
  const finderCount = users.filter(u => u.role === 'finder').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="users" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-gray-600">Manage all registered users on the platform</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Total Users</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-green-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Clients</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{clientCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Finders</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{finderCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-finder-red rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Admins</h3>
              <p className="text-xl sm:text-2xl font-bold text-finder-red">{adminCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Users ({filteredUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search criteria." : "No users have registered yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userData: User) => (
                  <div key={userData.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {userData.firstName} {userData.lastName}
                        </h4>
                        <p className="text-gray-600 text-sm truncate">{userData.email}</p>
                        {userData.phone && (
                          <p className="text-gray-500 text-xs truncate">{userData.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Badge variant={
                          userData.role === 'admin' ? 'destructive' :
                          userData.role === 'finder' ? 'default' :
                          'secondary'
                        } className="w-fit">
                          {userData.role}
                        </Badge>
                        <div className="flex items-center">
                          {userData.isVerified ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-finder-red" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 sm:ml-4">
                      <span className="text-sm text-gray-500">
                        <span className="hidden sm:inline">Joined </span>
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {userData.role === 'finder' ? (
                            <Link href={`/finder-profile/${userData.id}`}>
                              <DropdownMenuItem>View Finder Profile</DropdownMenuItem>
                            </Link>
                          ) : (
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleVerifyUser(userData.id, !userData.isVerified)}>
                            {userData.isVerified ? "Unverify" : "Verify"} User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={userData.isBanned ? "text-green-600" : "text-finder-red"}
                            onClick={() => handleBanUser(userData.id, !userData.isBanned)}
                          >
                            {userData.isBanned ? "Unban" : "Ban"} User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ban User Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You are about to ban <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email}).
                This will prevent them from accessing the platform.
              </p>
              <div>
                <Label htmlFor="banReason">Reason for ban *</Label>
                <Textarea
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Please provide a reason for banning this user..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmBanUser}
                  disabled={!banReason.trim() || banUserMutation.isPending}
                >
                  {banUserMutation.isPending ? "Banning..." : "Ban User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}