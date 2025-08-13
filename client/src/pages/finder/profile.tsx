import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, X, MapPin, Award, Clock } from "lucide-react";
import type { Finder } from "@shared/schema";

export default function FinderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: "",
    hourlyRate: "",
    availability: "full-time"
  });

  const { data: finder, isLoading } = useQuery<Finder>({
    queryKey: ['/api/finder/profile'],
    enabled: !!user,
    onSuccess: (data) => {
      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        skills: data.skills?.join(", ") || "",
        hourlyRate: data.hourlyRate?.toString() || "",
        availability: data.availability || "full-time"
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/finder/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        skills: data.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/profile'] });
      setIsEditing(false);
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

  const handleCancel = () => {
    if (finder) {
      setFormData({
        name: finder.name || "",
        bio: finder.bio || "",
        skills: finder.skills?.join(", ") || "",
        hourlyRate: finder.hourlyRate?.toString() || "",
        availability: finder.availability || "full-time"
      });
    }
    setIsEditing(false);
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
      
      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your profile information and preferences</p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={updateProfileMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing && finder && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{finder.completedJobs || 0}</div>
                    <div className="text-sm text-gray-600">Jobs Completed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${finder.totalEarnings || 0}</div>
                    <div className="text-sm text-gray-600">Total Earnings</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{finder.rating || 0}/5</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Badge variant={finder.isVerified ? "default" : "secondary"}>
                      {finder.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">Status</div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded border">{finder?.name || "Not set"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  {isEditing ? (
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g., 25"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded border">
                      {finder?.hourlyRate ? `$${finder.hourlyRate}/hour` : "Not set"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                {isEditing ? (
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
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded border capitalize">
                    {finder?.availability || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1"
                    rows={4}
                    placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                  />
                ) : (
                  <p className="mt-1 p-3 bg-gray-50 rounded border min-h-[100px]">
                    {finder?.bio || "No bio provided"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                {isEditing ? (
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    className="mt-1"
                    placeholder="e.g., Research, Data Analysis, Web Scraping, Market Research"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded border">
                    {finder?.skills && finder.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {finder.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    ) : (
                      "No skills listed"
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}