import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import AdminIssueStrike from "@/components/admin-issue-strike";
import { 
  Users, 
  Search,
  CheckCircle,
  XCircle,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MoreVertical,
  Crown,
  Star,
  Eye,
  Ban,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

interface ExtendedUser extends User {
  profileImageUrl?: string;
}

export default function AdminUsersModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [banReason, setBanReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

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

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'finder': return <Star className="w-4 h-4" />;
      case 'client': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
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
    // Helper function to create name-based URL segment
    const createNameSlug = (firstName: string, lastName: string, id: string) => {
      const name = `${firstName}${lastName}`.replace(/[^a-zA-Z0-9]/g, '');
      const idInitials = id.split('-')[0].slice(0, 8); // First 8 chars of ID
      return `${name}${idInitials}`;
    };

    switch (userData.role) {
      case 'finder':
        return `/finder-profile/${createNameSlug(userData.firstName || '', userData.lastName || '', userData.id)}`;
      case 'client':
        return `/client/profile/${createNameSlug(userData.firstName || '', userData.lastName || '', userData.id)}`;
      default:
        return '#'; // Admin users don't have public profiles
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
      
      {/* Modern Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-60"></div>
                  <div className="relative p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl">
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
        {/* Modern Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredUsers.map((userData) => (
            <Card key={userData.id} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-xl sm:rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                {/* User Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Profile Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                        {userData.profileImageUrl ? (
                          <img 
                            src={userData.profileImageUrl} 
                            alt={`${userData.firstName} ${userData.lastName}`}
                            className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                          />
                        ) : (
                          `${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`
                        )}
                      </div>
                      {/* Status Indicator */}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                        userData.isBanned ? 'bg-red-500' : userData.isVerified ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {userData.role === 'admin' ? (
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                          {userData.firstName} {userData.lastName}
                        </h3>
                      ) : (
                        <Link href={getProfileUrl(userData)}>
                          <h3 className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate cursor-pointer transition-colors">
                            {userData.firstName} {userData.lastName}
                          </h3>
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userData.role)}`}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(userData.role)}
                            <span className="hidden sm:inline">
                              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                            </span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
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
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
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
                                  onClick={(e) => {
                                    console.log("Strike button clicked in dropdown");
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
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
                
                {/* User Details */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex items-center gap-2 pt-2">
                    {userData.isVerified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {userData.isBanned && (
                      <Badge className="bg-red-100 text-red-800 border-red-200 px-2 py-1 rounded-full text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        Banned
                      </Badge>
                    )}
                    {!userData.isVerified && !userData.isBanned && (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1 rounded-full text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
        
        {/* Stats Grid - Moved to Bottom */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.verified}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Banned</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.banned}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.admins}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Finders</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.finders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 text-teal-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Clients</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.clients}</p>
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
              className="min-h-[100px] rounded-xl border-gray-300 dark:border-gray-600"
              required
            />
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={confirmBanUser} 
                disabled={!banReason.trim() || banUserMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11"
              >
                {banUserMutation.isPending ? 'Banning...' : 'Confirm Ban'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setBanDialogOpen(false)}
                className="px-6 h-11 border-gray-300 dark:border-gray-600 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}