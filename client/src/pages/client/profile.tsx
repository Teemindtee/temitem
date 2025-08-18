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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={() => navigate("/client/dashboard")} 
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="font-medium text-sm sm:text-base">Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">
                <User className="w-3 h-3 mr-1" />
                Client
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="relative mb-6">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border-4 border-blue-200 shadow-lg">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl sm:text-2xl font-bold">
                      {((user.firstName || "") + (user.lastName || ""))
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-600 mb-4">{user.email}</p>
                
                <div className="flex items-center justify-center space-x-1 mb-6">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.floor(clientStats.avgRating) ? 'text-amber-400 fill-current' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 ml-2">
                    {clientStats.avgRating} rating
                  </span>
                </div>

                <Badge className="bg-green-100 text-green-800 border-green-200 mb-6">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified Client
                </Badge>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Joined {format(new Date(clientStats.joinDate), 'MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Nigeria</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Client Statistics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      Total Finds
                    </span>
                    <span className="font-semibold text-slate-900">{clientStats.totalFinds}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      Active Finds
                    </span>
                    <span className="font-semibold text-green-600">{clientStats.activeFinds}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                    <span className="font-semibold text-blue-600">{clientStats.completedFinds}</span>
                  </div>

                  <Separator />
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ₦{clientStats.totalSpent.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">Total Invested</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-slate-900">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline" 
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleCancel}
                        variant="outline" 
                        size="sm"
                        className="border-slate-200 hover:bg-slate-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={updateProfile.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="animate-spin w-4 h-4 mr-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className="mt-2 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className="mt-2 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="mt-2 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="mt-2 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">First Name</div>
                        <div className="text-slate-900 font-medium">{user.firstName || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500 mb-1">Last Name</div>
                        <div className="text-slate-900 font-medium">{user.lastName || 'Not provided'}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Email Address
                      </div>
                      <div className="text-slate-900 font-medium">{user.email}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Phone Number
                      </div>
                      <div className="text-slate-900 font-medium">{user.phone || 'Not provided'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Password</h4>
                        <p className="text-sm text-slate-600">Update your password</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate("/client/change-password")}
                      variant="outline" 
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Notifications</h4>
                        <p className="text-sm text-slate-600">Manage notification preferences</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Security</h4>
                        <p className="text-sm text-slate-600">Two-factor authentication</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">Find completed successfully</p>
                      <p className="text-sm text-slate-600">Web development project - 2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">New find posted</p>
                      <p className="text-sm text-slate-600">Mobile app design - 5 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                      <Star className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">Received 5-star rating</p>
                      <p className="text-sm text-slate-600">Logo design project - 1 week ago</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    View All Activity
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