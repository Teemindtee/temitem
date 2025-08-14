import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinderHeader } from "@/components/finder-header";
import { FinderLevelBadge } from "@/components/finder-level-badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Award, Star, User } from "lucide-react";
import type { Finder } from "@shared/schema";

export default function FinderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    hourlyRate: "",
    availability: "full-time"
  });

  const { data: finder, isLoading } = useQuery<any>({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  // Update form data when finder data changes
  useEffect(() => {
    if (finder) {
      setFormData({
        bio: finder.bio || "",
        skills: Array.isArray(finder.skills) ? finder.skills.join(", ") : "",
        hourlyRate: finder.hourlyRate?.toString() || "",
        availability: finder.availability || "full-time"
      });
    }
  }, [finder]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/api/finder/profile', {
      bio: data.bio,
      skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
      hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
      availability: data.availability
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/profile'] });
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  // Get star rating display
  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-6 h-6 ${i < rating ? 'text-finder-red fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="profile" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = finder?.user ? `${finder.user.firstName} ${finder.user.lastName}`.trim() : "Not available";

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="profile" />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        {/* Beautiful Profile Card - Like the Design */}
        {finder && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Red Header */}
              <div className="bg-finder-red px-8 py-6 text-center">
                <h1 className="text-white text-2xl font-bold">FinderMeister</h1>
              </div>
              
              {/* Profile Content */}
              <div className="px-8 py-8 text-center bg-white">
                {/* Profile Picture Placeholder */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                  {/* Level Badge */}
                  <div className="absolute -bottom-2 -right-2">
                    <FinderLevelBadge 
                      completedJobs={finder.jobsCompleted || 0} 
                      className="text-sm px-3 py-1"
                    />
                  </div>
                </div>
                
                {/* Name */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{fullName}</h2>
                
                {/* Stars */}
                <div className="flex justify-center mb-4">
                  {getStarRating(Math.round(parseFloat(finder.averageRating || "5.0")))}
                </div>
                
                {/* Completed Jobs */}
                <p className="text-lg text-gray-600 mb-4 font-medium">
                  {finder.jobsCompleted || 0} Completed Finds
                </p>
                
                {/* Testimonials/Bio */}
                <div className="space-y-2 mb-8">
                  {finder.bio && (
                    <p className="text-gray-700 italic">"{finder.bio}"</p>
                  )}
                  {!finder.bio && (
                    <>
                      <p className="text-gray-700 italic">"Extremely reliable and efficient"</p>
                      <p className="text-gray-700 italic">"Went above and beyond to help me out!"</p>
                    </>
                  )}
                </div>
                
                {/* Hire Button */}
                <Button className="w-full bg-finder-red hover:bg-finder-red-dark text-white font-bold py-4 text-lg rounded-xl">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Stats */}
            {finder && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-finder-red">{finder.jobsCompleted || 0}</div>
                  <div className="text-sm text-gray-600">Jobs Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${finder.totalEarned || 0}</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{parseFloat(finder.averageRating || "5.0").toFixed(1)}/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <Badge variant={finder.user?.isVerified ? "default" : "secondary"}>
                    {finder.user?.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">Status</div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name - Read Only */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={fullName}
                  disabled
                  className="mt-1 bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Contact admin to change your name</p>
              </div>

              {/* Hourly Rate */}
              <div>
                <Label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="Enter your hourly rate"
                  className="mt-1"
                />
              </div>

              {/* Availability */}
              <div>
                <Label htmlFor="availability" className="text-sm font-medium">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="weekends">Weekends Only</SelectItem>
                    <SelectItem value="evenings">Evenings Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your experience and expertise"
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Skills */}
              <div>
                <Label htmlFor="skills" className="text-sm font-medium">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g., Research, Web Development, Content Writing"
                  className="mt-1"
                />
              </div>

              {/* Update Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-finder-red hover:bg-finder-red-dark text-white"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}