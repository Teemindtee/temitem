import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, X, Award } from "lucide-react";
import type { Finder } from "@shared/schema";

export default function FinderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
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
      const fullName = finder.user ? `${finder.user.firstName} ${finder.user.lastName}` : "";
      setFormData({
        name: fullName.trim(),
        bio: finder.bio || "",
        skills: Array.isArray(finder.skills) ? finder.skills.join(", ") : "",
        hourlyRate: finder.hourlyRate?.toString() || "",
        availability: finder.availability || "full-time"
      });
    }
  }, [finder]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/finder/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
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

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleReset = () => {
    if (finder) {
      const fullName = finder.user ? `${finder.user.firstName} ${finder.user.lastName}` : "";
      setFormData({
        name: fullName.trim(),
        bio: finder.bio || "",
        skills: Array.isArray(finder.skills) ? finder.skills.join(", ") : "",
        hourlyRate: finder.hourlyRate?.toString() || "",
        availability: finder.availability || "full-time"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="profile" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="profile" />
      
      <div className="max-w-6xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Profile Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your personal information and professional details</p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {finder && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{finder.jobsCompleted || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Jobs Completed</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">${finder.totalEarned || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Earnings</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{parseFloat(finder.averageRating || "5.0").toFixed(1)}/5</div>
                    <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <Badge variant={finder.user?.isVerified ? "default" : "secondary"} className="mb-1">
                        {finder.user?.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                      <div className="text-xs sm:text-sm text-gray-600">Status</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full"
                    disabled
                    placeholder="Name changes require admin approval"
                  />
                  <p className="text-xs text-gray-500">Contact admin to change your name</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full"
                    placeholder="e.g., 25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability" className="text-sm font-medium">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger className="w-full">
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

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full"
                  rows={4}
                  placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full"
                  placeholder="e.g., Research, Data Analysis, Web Scraping, Market Research"
                />
              </div>
              
              {/* Action buttons moved to bottom */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={updateProfileMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="flex-1 sm:flex-none"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}