import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase,
  Edit,
  Save,
  Eye,
  Users,
  Target,
  Award,
  TrendingUp,
  Settings,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Clock,
  Star
} from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import ClientHeader from "@/components/client-header";
import AdminHeader from "@/components/admin-header";

export default function ClientProfile() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get userId from URL parameters (direct userId in path)
  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const queryUserId = urlParams.get('userId');
  
  // Handle both nameSlug and direct userId routes
  const viewUserId = queryUserId || params.userId;
  const isAdminViewing = user?.role === 'admin' && !!viewUserId;
  
  // Fetch user's requests for statistics
  const { data: requests = [] } = useQuery({
    queryKey: ['/api/client/finds'],
    queryFn: () => apiRequest('/api/client/finds'),
    enabled: !isAdminViewing && user?.role === 'client',
  });
  
  // Fetch user data if admin is viewing another user's profile
  const { data: profileUser, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['/api/admin/users', viewUserId],
    queryFn: () => {
      console.log('Fetching profile user for:', viewUserId);
      return apiRequest(`/api/admin/users/${viewUserId}`);
    },
    enabled: Boolean(isAdminViewing && viewUserId),
  });

  // Use either the profile user (for admin viewing) or the logged-in user (for self-viewing)
  const displayUser = isAdminViewing ? profileUser : user;

  // Debug logging
  console.log('Profile page state:', {
    user,
    authLoading,
    isAdminViewing,
    viewUserId,
    displayUser,
    profileLoading,
    profileError,
    userRole: user?.role,
    displayUserExists: !!displayUser
  });

  // Additional check: if we have a user but no displayUser, something is wrong
  if (user && !authLoading && !displayUser) {
    console.error('User exists but displayUser is null:', { user, isAdminViewing, profileUser });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Loading Error</h1>
          <p className="text-slate-600 mb-6">There was an issue loading your profile. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: displayUser?.firstName || '',
    lastName: displayUser?.lastName || '',
    email: displayUser?.email || '',
    phone: displayUser?.phone || '',
  });

  // Update form data when user data loads/changes
  useEffect(() => {
    if (displayUser) {
      setFormData({
        firstName: displayUser.firstName || '',
        lastName: displayUser.lastName || '',
        email: displayUser.email || '',
        phone: displayUser.phone || '',
      });
    }
  }, [displayUser]);

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Only allow self-editing for now (admins can view but not edit from this page)
      if (isAdminViewing) {
        throw new Error("Admins can view but not edit client profiles from this page");
      }
      return apiRequest('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone || '',
      });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCancel = () => {
    if (displayUser) {
      setFormData({
        firstName: displayUser.firstName || '',
        lastName: displayUser.lastName || '',
        email: displayUser.email || '',
        phone: displayUser.phone || '',
      });
    }
    setIsEditing(false);
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
          <p className="text-slate-600">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  // Access control: allow clients to view their own profile, or admins to view any client profile
  if (!user || (user.role !== 'client' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">This page is only accessible by clients or admins.</p>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // If admin is viewing without a specific userId, show error
  if (user.role === 'admin' && !viewUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">User ID Required</h1>
          <p className="text-slate-600 mb-6">Please provide a userId parameter to view a client profile.</p>
          <Button onClick={() => navigate("/admin/users")} className="bg-blue-600 hover:bg-blue-700">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while profile is loading for admin
  if (isAdminViewing && profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading Profile...</h1>
          <p className="text-slate-600">Please wait while we load the user profile.</p>
        </div>
      </div>
    );
  }

  // Show error state if profile loading failed for admin
  if (isAdminViewing && profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h1>
          <p className="text-slate-600 mb-6">The requested user profile could not be loaded.</p>
          <Button onClick={() => navigate("/admin/users")} className="bg-blue-600 hover:bg-blue-700">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  // Ensure we have a displayUser before proceeding
  if (!displayUser) {
    console.warn('No displayUser available, redirecting to access denied');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Available</h1>
          <p className="text-slate-600 mb-6">Unable to load profile data. Please try again.</p>
          <Button onClick={() => navigate("/client/dashboard")} className="bg-blue-600 hover:bg-blue-700">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Get real client statistics from the requests data
  const clientStats = {
    totalFinds: requests?.length || 0,
    activeFinds: requests?.filter((r: any) => r.status === 'open' || r.status === 'in_progress').length || 0,
    completedFinds: requests?.filter((r: any) => r.status === 'completed').length || 0,
    totalSpent: 0, // This would need to be calculated from completed contracts
    joinDate: displayUser?.createdAt || new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -z-10" style={{ backgroundColor: "hsl(1, 81%, 63%)" }} />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 -z-10" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -z-10" style={{ backgroundColor: "hsl(1, 81%, 73%)" }} />

      {isAdminViewing ? (
        <AdminHeader currentPage="users" />
      ) : (
        <ClientHeader currentPage="profile" />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-slate-200/25 hover:shadow-3xl transition-all duration-500 group">
              <CardContent className="p-8 sm:p-10 text-center">
                <div className="relative mb-8">
                  <div className="relative">
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 mx-auto border-4 border-white shadow-2xl ring-4 transition-all duration-300 group-hover:ring-opacity-70 ring-red-200">
                      <AvatarFallback className="text-white text-2xl sm:text-3xl font-bold" style={{ background: "linear-gradient(to bottom right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                        {((displayUser?.firstName || "") + (displayUser?.lastName || ""))
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full animate-pulse" style={{ background: "linear-gradient(to bottom right, hsl(1, 81%, 63%, 0.2), hsl(1, 81%, 53%, 0.2))" }} />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 ring-2 ring-white" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent mb-3" style={{ backgroundImage: "linear-gradient(to right, hsl(213, 27%, 16%), hsl(1, 81%, 53%))" }}>
                  {displayUser?.firstName} {displayUser?.lastName}
                </h2>
                <p className="text-slate-600 mb-6 font-medium">{displayUser?.email}</p>
                
                <div className="flex items-center justify-center space-x-1 mb-8">
                  <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-full">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-slate-700 font-medium">
                      Member since {format(new Date(clientStats.joinDate), 'MMM yyyy')}
                    </span>
                  </div>
                </div>

                <Badge className="text-white border-0 px-4 py-2 mb-8 shadow-lg" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verified Client
                </Badge>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-center bg-slate-50/80 rounded-full py-2 px-4">
                    <Calendar className="w-4 h-4 mr-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                    <span className="font-medium text-slate-700">Joined {format(new Date(clientStats.joinDate), 'MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-center bg-slate-50/80 rounded-full py-2 px-4">
                    <MapPin className="w-4 h-4 mr-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                    <span className="font-medium text-slate-700">Nigeria</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500" style={{ background: "linear-gradient(135deg, hsl(1, 81%, 95%, 0.8), hsl(210, 20%, 95%, 0.8))", boxShadow: "0 25px 50px -12px hsl(1, 81%, 53%, 0.25)" }}>
              <CardContent className="p-8 sm:p-10">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Client Statistics
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/60 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: "hsl(1, 81%, 95%)" }}>
                        <Target className="w-3 h-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                      </div>
                      Total Finds
                    </span>
                    <span className="font-bold text-xl text-slate-900">{clientStats.totalFinds}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white/60 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Eye className="w-3 h-3 text-green-600" />
                      </div>
                      Active Finds
                    </span>
                    <span className="font-bold text-xl text-green-600">{clientStats.activeFinds}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white/60 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                        <Award className="w-3 h-3 text-slate-600" />
                      </div>
                      Completed
                    </span>
                    <span className="font-bold text-xl text-slate-600">{clientStats.completedFinds}</span>
                  </div>

                  <div className="rounded-2xl p-6 text-center text-white shadow-lg" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                    <div className="text-3xl font-bold mb-2">
                      {clientStats.totalFinds}
                    </div>
                    <div className="text-sm opacity-90 font-medium">Total Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-slate-200/25 hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="flex items-center text-slate-900 text-xl">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ 
                        background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))",
                        backgroundImage: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundImage = "linear-gradient(to right, hsl(1, 71%, 43%), hsl(1, 61%, 33%))";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundImage = "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))";
                      }}
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleCancel}
                        variant="outline" 
                        size="sm"
                        className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={updateProfile.isPending}
                        size="sm"
                        className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ 
                          background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))",
                          backgroundImage: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundImage = "linear-gradient(to right, hsl(1, 71%, 43%), hsl(1, 61%, 33%))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundImage = "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))";
                        }}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 sm:p-10">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <Label htmlFor="firstName" className="text-slate-700 font-semibold text-sm mb-3 block">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                          style={{ 
                            borderColor: "hsl(210, 20%, 90%)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "hsl(1, 81%, 53%)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px hsl(1, 81%, 90%)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "hsl(210, 20%, 90%)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-slate-700 font-semibold text-sm mb-3 block">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                          style={{ 
                            borderColor: "hsl(210, 20%, 90%)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "hsl(1, 81%, 53%)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px hsl(1, 81%, 90%)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "hsl(210, 20%, 90%)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-slate-700 font-semibold text-sm mb-3 block">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        style={{ 
                          borderColor: "hsl(210, 20%, 90%)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "hsl(1, 81%, 53%)";
                          e.currentTarget.style.boxShadow = "0 0 0 3px hsl(1, 81%, 90%)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "hsl(210, 20%, 90%)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm mb-3 block">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        style={{ 
                          borderColor: "hsl(210, 20%, 90%)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "hsl(1, 81%, 53%)";
                          e.currentTarget.style.boxShadow = "0 0 0 3px hsl(1, 81%, 90%)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "hsl(210, 20%, 90%)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                        <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">First Name</div>
                        <div className="text-slate-900 font-semibold text-lg">{displayUser?.firstName || 'Not provided'}</div>
                      </div>
                      <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                        <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Last Name</div>
                        <div className="text-slate-900 font-semibold text-lg">{displayUser?.lastName || 'Not provided'}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                      <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center">
                        <Mail className="w-4 h-4 mr-2" style={{ color: "hsl(1, 81%, 53%)" }} />
                        Email Address
                      </div>
                      <div className="text-slate-900 font-semibold text-lg">{displayUser?.email}</div>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                      <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center">
                        <Phone className="w-4 h-4 mr-2" style={{ color: "hsl(1, 81%, 53%)" }} />
                        Phone Number
                      </div>
                      <div className="text-slate-900 font-semibold text-lg">{displayUser?.phone || 'Not provided'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-slate-200/25 hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-slate-900 text-xl">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 sm:p-10">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl transition-all duration-300 border" style={{ background: "linear-gradient(to right, hsl(1, 81%, 95%, 0.8), hsl(210, 20%, 95%, 0.8))", borderColor: "hsl(1, 81%, 90%, 0.5)" }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">Password Security</h4>
                        <p className="text-sm text-slate-600">Update your account password</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate("/client/change-password")}
                      className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ 
                        background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))",
                        backgroundImage: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundImage = "linear-gradient(to right, hsl(1, 71%, 43%), hsl(1, 61%, 33%))";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundImage = "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))";
                      }}
                      size="sm"
                    >
                      Change Password
                    </Button>
                  </div>

                  
                </div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </main>
    </div>
  );
}