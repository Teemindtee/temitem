import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdminHeader from "@/components/admin-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminIssueStrike from "@/components/admin-issue-strike";
import { 
  Users, 
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Mail,
  Calendar,
  Crown,
  Star,
  ShieldCheck,
  Ban
} from "lucide-react";
import { Link } from "wouter";

interface ExtendedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'finder' | 'client';
  isVerified: boolean;
  isBanned: boolean;
  createdAt?: string;
  profileImageUrl?: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  const { data: users = [], isLoading } = useQuery<ExtendedUser[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin'
  });

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'verify' | 'unverify' }) => {
      return await apiRequest(`/api/admin/users/${userId}/${action}`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User verification updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update user verification", variant: "destructive" });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: 'ban' | 'unban'; reason?: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/${action}`, { 
        method: "POST", 
        body: action === 'ban' ? JSON.stringify({ reason }) : undefined 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
      toast({ title: "Success", description: "User ban status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update ban status", variant: "destructive" });
    }
  });

  const handleVerifyUser = (userId: string, shouldVerify: boolean) => {
    verifyUserMutation.mutate({ userId, action: shouldVerify ? 'verify' : 'unverify' });
  };

  const handleBanUser = (userToBan: ExtendedUser, shouldBan: boolean) => {
    if (shouldBan) {
      setSelectedUser(userToBan);
      setBanDialogOpen(true);
    } else {
      banUserMutation.mutate({ userId: userToBan.id, action: 'unban' });
    }
  };

  const confirmBanUser = () => {
    if (!selectedUser || !banReason.trim()) return;
    banUserMutation.mutate({ userId: selectedUser.id, action: 'ban', reason: banReason });
  };

  // Filter users based on search term and exclude admins
  const filteredUsers = users.filter(u => 
    u.role !== 'admin' && (
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'finder': return <Star className="w-3 h-3" />;
      case 'client': return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
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

  const getProfileUrl = (userData: ExtendedUser) => {
    switch (userData.role) {
      case 'finder':
        return `/finder-profile/${userData.id}`;
      case 'client':
        return `/client/profile/${userData.id}`;
      default:
        return '#';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AdminHeader currentPage="users" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: users.length,
    verified: users.filter(u => u.isVerified).length,
    banned: users.filter(u => u.isBanned).length,
    admins: users.filter(u => u.role === 'admin').length,
    finders: users.filter(u => u.role === 'finder').length,
    clients: users.filter(u => u.role === 'client').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="users" />
      
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-60"></div>
                  <div className="relative p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Monitor and manage platform users</p>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Compact Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredUsers.map((userData) => (
            <Link key={userData.id} href={getProfileUrl(userData)}>
              <Card className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-lg overflow-hidden">
                <CardContent className="p-3">
                    {/* Compact User Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Smaller Profile Image */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-8 h-8 bg-gradient-to-br ${
                            userData.role === 'admin' ? 'from-purple-500 to-purple-600' :
                            userData.role === 'finder' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'
                          } rounded-lg flex items-center justify-center text-white font-bold text-xs`}>
                            {userData.profileImageUrl ? (
                              <img 
                                src={userData.profileImageUrl} 
                                alt={`${userData.firstName} ${userData.lastName}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              `${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`
                            )}
                          </div>
                          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${
                            userData.isBanned ? 'bg-red-500' : userData.isVerified ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate transition-colors">
                            {userData.firstName} {userData.lastName}
                          </h3>
                          <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(userData.role)}`}>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(userData.role)}
                              <span>{userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Smaller Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg">
                          <DropdownMenuItem onClick={() => handleVerifyUser(userData.id, !userData.isVerified)} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                            {userData.isVerified ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {userData.isVerified ? 'Unverify User' : 'Verify User'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleBanUser(userData, !userData.isBanned)} 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {userData.isBanned ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {userData.isBanned ? 'Unban User' : 'Ban User'}
                          </DropdownMenuItem>
                          
                          {(userData.role === 'client' || userData.role === 'finder') && (
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              asChild
                            >
                              <div className="p-0">
                                <AdminIssueStrike
                                  userId={userData.id}
                                  userRole={userData.role as 'client' | 'finder'}
                                  userName={`${userData.firstName} ${userData.lastName}`}
                                  trigger={
                                    <button 
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 w-full text-left cursor-pointer"
                                      type="button"
                                    >
                                      <AlertTriangle className="w-4 h-4" />
                                      Issue Strike
                                    </button>
                                  }
                                  onStrikeIssued={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })}
                                />
                              </div>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Condensed User Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{userData.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      
                      {/* Compact Status Badges */}
                      <div className="flex items-center gap-1 pt-1">
                        {userData.isVerified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 px-1.5 py-0.5 rounded-full text-xs">
                            <CheckCircle className="w-2.5 h-2.5 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {userData.isBanned && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 px-1.5 py-0.5 rounded-full text-xs">
                            <XCircle className="w-2.5 h-2.5 mr-1" />
                            Banned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
          </div>
        )}
        
        {/* Compact Stats Grid */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verified</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.verified}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Banned</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.banned}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admins</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.admins}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Finders</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.finders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-500/10 text-teal-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Clients</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.clients}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-gray-600 dark:text-gray-400">
              You are about to ban <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>. 
              Please provide a reason for the ban:
            </p>
            <Textarea
              placeholder="Enter ban reason..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              rows={3}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={() => setBanDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmBanUser}
                disabled={!banReason.trim() || banUserMutation.isPending}
                className="rounded-xl"
              >
                {banUserMutation.isPending ? "Banning..." : "Ban User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}