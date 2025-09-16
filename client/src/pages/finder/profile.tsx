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
import type { Finder, Category } from "@shared/schema";

export default function FinderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    bio: "",
    category: "", // Kept for backward compatibility, but new logic uses 'categories'
    categories: [] as string[], // New field for multiple categories
    skills: "",
    availability: "full-time"
  });

  const { data: finder, isLoading } = useQuery<any>({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user
  });

  // Update form data when finder data changes
  useEffect(() => {
    if (finder) {
      setFormData({
        bio: finder.bio || "",
        category: finder.category || "", // For backward compatibility if needed
        categories: Array.isArray(finder.categories) ? finder.categories : (finder.category ? [finder.category] : []), // Initialize with existing single category if available
        skills: Array.isArray(finder.skills) ? finder.skills.join(", ") : "",
        availability: finder.availability || "full-time"
      });
    }
  }, [finder]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        bio: data.bio || "",
        category: data.category || "", // Keep for backward compatibility
        categories: data.categories || [], // New multiple categories field
        skills: typeof data.skills === 'string'
          ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
          : data.skills || [],
        availability: data.availability || "full-time"
      };

      // For API, ensure we only send 'categories' if it's not empty, otherwise send the old 'category' if present
      if (payload.categories.length > 0) {
        delete payload.category; // Remove the old single category field if new ones are provided
      } else if (payload.category) {
        // If no new categories are selected, but an old one exists, keep it.
        // If both are empty, the API should handle it.
      } else {
        // If neither categories nor category are present, remove category to avoid sending empty string if not intended.
        delete payload.category;
      }


      const response = await apiRequest('PATCH', '/api/finder/profile', payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/profile'] });
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);

      // Check if it's an authentication error
      if (error.message?.includes('No authentication token') || error.message?.includes('Access token required')) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    // Basic validation
    if (formData.categories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one specialty category.",
        variant: "destructive",
      });
      return;
    }

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
                <Button className="w-full bg-finder-red hover:bg-finder-red-dark text-white py-4 text-lg rounded-xl">
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
                  <div className="text-2xl font-bold text-green-600">₦{finder.totalEarned || 0}</div>
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

              {/* Categories - Multiple Selection */}
              <div>
                <Label htmlFor="categories">Categories</Label>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Select all categories that match your skills and expertise:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border rounded-md bg-white/80">
                    {categoriesLoading ? (
                      <div className="col-span-full text-center py-4 text-gray-500">Loading categories...</div>
                    ) : categories.length > 0 ? (
                      categories
                        .filter(category => category.isActive)
                        .map((category) => (
                          <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.categories.includes(category.name)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  categories: isChecked
                                    ? [...prev.categories, category.name]
                                    : prev.categories.filter(cat => cat !== category.name)
                                }));
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          </label>
                        ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-500">No categories available</div>
                    )}
                  </div>
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.categories.map((categoryName) => (
                        <Badge key={categoryName} variant="secondary" className="text-xs">
                          {categoryName}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                categories: prev.categories.filter(cat => cat !== categoryName)
                              }));
                            }}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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
              <div className="pt-4 flex justify-center">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                  className="bg-finder-red hover:bg-finder-red-dark text-white px-8 py-2"
                  size="default"
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