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
import { useState } from "react";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
              <Shield className="w-6 h-6" />
              <span className="text-xl font-bold">User Management</span>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-gray-600">Manage all registered users on the platform</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clients</h3>
              <p className="text-2xl font-bold text-green-600">{clientCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Finders</h3>
              <p className="text-2xl font-bold text-purple-600">{finderCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Admins</h3>
              <p className="text-2xl font-bold text-red-600">{adminCount}</p>
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
                  <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {userData.firstName} {userData.lastName}
                        </h4>
                        <p className="text-gray-600 text-sm">{userData.email}</p>
                        {userData.phone && (
                          <p className="text-gray-500 text-xs">{userData.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={
                          userData.role === 'admin' ? 'destructive' :
                          userData.role === 'finder' ? 'default' :
                          'secondary'
                        }>
                          {userData.role}
                        </Badge>
                        <div className="flex items-center">
                          {userData.isVerified ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-sm text-gray-500">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Suspend User
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
      </div>
    </div>
  );
}