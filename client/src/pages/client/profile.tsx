import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  Shield,
  Star,
  Eye,
  Users,
  Target,
  Award,
  TrendingUp,
  Settings,
  Bell,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Clock
} from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function ClientProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Update form data when user data loads/changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
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
        description: "Failed to update profile. Please try again.",
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
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
  };

  // Redirect if not authenticated or not client
  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">This page is only accessible by clients.</p>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Mock stats for demonstration (these would come from API in real app)
  const clientStats = {
    totalFinds: 5,
    activeFinds: 3,
    completedFinds: 2,
    totalSpent: 45000,
    avgRating: 4.8,
    joinDate: user.createdAt || new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -z-10" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 -z-10" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -z-10" />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-slate-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <button 
              onClick={() => navigate("/client/dashboard")} 
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200 p-2 -ml-2 rounded-xl hover:bg-white/80 hover:shadow-md group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              <span className="font-semibold text-sm sm:text-base">Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Badge className="bg-gradient-to-r from-red-600 to-red-800 text-white border-0 text-xs sm:text-sm px-3 py-1.5 shadow-lg">
                <User className="w-3 h-3 mr-1.5" />
                Client Account
              </Badge>
            </div>
          </div>
        </div>
      </header>

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
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 mx-auto border-4 border-white shadow-2xl ring-4 ring-red-100/50 transition-all duration-300 group-hover:ring-red-200/70">
                      <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-800 text-white text-2xl sm:text-3xl font-bold">
                        {((user.firstName || "") + (user.lastName || ""))
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-red-400/20 to-red-600/20 animate-pulse" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 ring-2 ring-white">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-red-800 bg-clip-text text-transparent mb-3">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-600 mb-6 font-medium">{user.email}</p>
                
                <div className="flex items-center justify-center space-x-1 mb-8">
                  <div className="flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 p-2 rounded-full">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${star <= Math.floor(clientStats.avgRating) ? 'text-amber-400 fill-current' : 'text-slate-300'} transition-all duration-300 hover:scale-110`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 ml-3 font-semibold">
                    {clientStats.avgRating} rating
                  </span>
                </div>

                <Badge className="bg-gradient-to-r from-red-600 to-red-800 text-white border-0 px-4 py-2 mb-8 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verified Client
                </Badge>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-center bg-slate-50/80 rounded-full py-2 px-4">
                    <Calendar className="w-4 h-4 mr-3 text-red-600" />
                    <span className="font-medium text-slate-700">Joined {format(new Date(clientStats.joinDate), 'MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-center bg-slate-50/80 rounded-full py-2 px-4">
                    <MapPin className="w-4 h-4 mr-3 text-red-600" />
                    <span className="font-medium text-slate-700">Nigeria</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-red-50/80 to-slate-50/80 backdrop-blur-xl border-white/30 shadow-2xl shadow-red-200/25 hover:shadow-3xl transition-all duration-500">
              <CardContent className="p-8 sm:p-10">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center text-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Client Statistics
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/60 rounded-2xl p-4 hover:bg-white/80 transition-all duration-200">
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Target className="w-3 h-3 text-red-600" />
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

                  <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 text-center text-white shadow-lg">
                    <div className="text-3xl font-bold mb-2">
                      ₦{clientStats.totalSpent.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90 font-medium">Total Invested</div>
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
                    <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                          className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 focus:border-red-400 focus:ring-red-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
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
                          className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 focus:border-red-400 focus:ring-red-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
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
                        className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 focus:border-red-400 focus:ring-red-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
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
                        className="h-12 bg-white/80 backdrop-blur-sm border-slate-200/60 focus:border-red-400 focus:ring-red-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                        <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">First Name</div>
                        <div className="text-slate-900 font-semibold text-lg">{user.firstName || 'Not provided'}</div>
                      </div>
                      <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                        <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Last Name</div>
                        <div className="text-slate-900 font-semibold text-lg">{user.lastName || 'Not provided'}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                      <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-red-600" />
                        Email Address
                      </div>
                      <div className="text-slate-900 font-semibold text-lg">{user.email}</div>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200">
                      <div className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-red-600" />
                        Phone Number
                      </div>
                      <div className="text-slate-900 font-semibold text-lg">{user.phone || 'Not provided'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-slate-200/25 hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-slate-900 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 sm:p-10">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-red-50/80 to-slate-50/80 rounded-2xl hover:from-red-50 hover:to-slate-50 transition-all duration-300 border border-red-100/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">Password Security</h4>
                        <p className="text-sm text-slate-600">Update your account password</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate("/client/change-password")}
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="sm"
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-slate-50/80 to-slate-50/80 rounded-2xl hover:from-slate-50 hover:to-slate-100 transition-all duration-300 border border-slate-200/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">Notifications</h4>
                        <p className="text-sm text-slate-600">Manage your notification preferences</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="sm"
                    >
                      Configure
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border border-green-100/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-600">Enhanced account security</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-700 text-white border-0 px-4 py-2 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Active & Secure
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-slate-200/25 hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-slate-900 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 sm:p-10">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl border border-green-100/50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg mt-1">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold text-lg">Find completed successfully</p>
                      <p className="text-sm text-slate-600 font-medium">Web development project - 2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100/50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mt-1">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold text-lg">New find posted</p>
                      <p className="text-sm text-slate-600 font-medium">Mobile app design - 5 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 rounded-2xl border border-amber-100/50 hover:from-amber-50 hover:to-yellow-50 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-2xl flex items-center justify-center shadow-lg mt-1">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold text-lg">Received 5-star rating</p>
                      <p className="text-sm text-slate-600 font-medium">Logo design project - 1 week ago</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button 
                    className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                  >
                    View Complete Activity History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}