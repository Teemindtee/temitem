import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin-header";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Crown, Award, Navigation, Search, User, CheckCircle, Star } from "lucide-react";

interface FinderLevel {
  id: string;
  name: string;
  description: string;
  minEarnedAmount: string;
  minJobsCompleted: number;
  minReviewPercentage: number;
  icon: string;
  iconUrl?: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const iconMap = {
  'User': User,
  'Navigation': Navigation,
  'Search': Search,
  'Award': Award,
  'Crown': Crown,
};

export default function AdminFinderLevels() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingLevel, setEditingLevel] = useState<FinderLevel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minEarnedAmount: "",
    minJobsCompleted: 0,
    minReviewPercentage: 0,
    icon: "User",
    iconUrl: "",
    color: "#3B82F6",
    order: 1,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ["/api/admin/finder-levels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/admin/finder-levels", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finder-levels"] });
      toast({ title: "Success", description: "Finder level created successfully" });
      resetForm();
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest(`/api/admin/finder-levels/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finder-levels"] });
      toast({ title: "Success", description: "Finder level updated successfully" });
      resetForm();
      setEditingLevel(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/finder-levels/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finder-levels"] });
      toast({ title: "Success", description: "Finder level deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      minEarnedAmount: "",
      minJobsCompleted: 0,
      minReviewPercentage: 0,
      icon: "User",
      iconUrl: "",
      color: "#3B82F6",
      order: 1,
      isActive: true,
    });
  };

  const handleEdit = (level: FinderLevel) => {
    setFormData({
      name: level.name,
      description: level.description,
      minEarnedAmount: level.minEarnedAmount,
      minJobsCompleted: level.minJobsCompleted,
      minReviewPercentage: level.minReviewPercentage,
      icon: level.icon,
      iconUrl: level.iconUrl || "",
      color: level.color,
      order: level.order,
      isActive: level.isActive,
    });
    setEditingLevel(level);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this finder level?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading finder levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="finder-levels" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
        {/* Modern Header Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-60"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Finder Levels
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Performance tier management</p>
                </div>
              </div>
              
              {!isCreating && !editingLevel && (
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Level
                </Button>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Levels</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{levels.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{levels.filter((l: FinderLevel) => l.isActive).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Highest Tier</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{levels.length > 0 ? Math.max(...levels.map((l: FinderLevel) => l.order)) : 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Min Score</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {levels.length > 0 ? Math.round(levels.reduce((acc: number, l: FinderLevel) => acc + l.minReviewPercentage, 0) / levels.length) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Modern Modal Form Overlay */}
          {(isCreating || editingLevel) && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-8 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                        {editingLevel ? <Edit className="w-7 h-7 text-white" /> : <Plus className="w-7 h-7 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {editingLevel ? 'Edit Finder Level' : 'Create New Finder Level'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          {editingLevel ? 'Modify the selected performance tier' : 'Add a new performance tier to the system'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingLevel(null);
                        resetForm();
                      }}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                {/* Modal Content */}
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                          <Award className="w-4 h-4" />
                        </div>
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Level Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Novice, Expert, Master"
                            className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="order" className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Order</Label>
                          <Input
                            id="order"
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                            min="1"
                            className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-6">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe this level and its requirements in detail"
                          rows={4}
                          className="px-4 py-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        Performance Requirements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="minEarnedAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Earned (₦)</Label>
                          <Input
                            id="minEarnedAmount"
                            type="number"
                            value={formData.minEarnedAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, minEarnedAmount: e.target.value }))}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="minJobsCompleted" className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Jobs</Label>
                          <Input
                            id="minJobsCompleted"
                            type="number"
                            value={formData.minJobsCompleted}
                            onChange={(e) => setFormData(prev => ({ ...prev, minJobsCompleted: parseInt(e.target.value) }))}
                            placeholder="0"
                            min="0"
                            className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="minReviewPercentage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Review (%)</Label>
                          <Input
                            id="minReviewPercentage"
                            type="number"
                            value={formData.minReviewPercentage}
                            onChange={(e) => setFormData(prev => ({ ...prev, minReviewPercentage: parseFloat(e.target.value) }))}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                            className="h-12 px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual Settings */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                          <Crown className="w-4 h-4" />
                        </div>
                        Visual Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="color" className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Color</Label>
                          <Input
                            id="color"
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                            className="w-full h-12 p-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="icon" className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon</Label>
                          <select
                            id="icon"
                            value={formData.icon}
                            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                            className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl"
                          >
                            <option value="User">👤 User</option>
                            <option value="Navigation">🧭 Navigation</option>
                            <option value="Search">🔍 Search</option>
                            <option value="Award">🏆 Award</option>
                            <option value="Crown">👑 Crown</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <input
                          id="isActive"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Active Level
                        </Label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium"
                      >
                        {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingLevel ? 'Update Level' : 'Create Level')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreating(false);
                          setEditingLevel(null);
                          resetForm();
                        }}
                        className="px-8 h-12 border-gray-300 dark:border-gray-600 rounded-xl font-medium"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Modern Levels Grid - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(levels as FinderLevel[]).map((level: FinderLevel) => {
              const IconComponent = iconMap[level.icon as keyof typeof iconMap] || User;
              
              return (
                <div key={level.id} className="group relative">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Level Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div 
                            className="absolute inset-0 rounded-2xl blur opacity-60"
                            style={{ backgroundColor: level.color }}
                          ></div>
                          <div 
                            className="relative p-4 rounded-2xl shadow-lg"
                            style={{ backgroundColor: level.color }}
                          >
                            {level.iconUrl ? (
                              <img 
                                src={level.iconUrl} 
                                alt={level.name} 
                                className="w-8 h-8 object-cover rounded filter brightness-0 invert"
                              />
                            ) : (
                              <IconComponent className="w-8 h-8 text-white" />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{level.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={level.isActive ? "default" : "secondary"}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: level.isActive ? level.color + '20' : undefined,
                                color: level.isActive ? level.color : undefined,
                                borderColor: level.isActive ? level.color + '40' : undefined 
                              }}
                            >
                              Tier {level.order}
                            </Badge>
                            {level.isActive && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 font-medium">Active</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(level)}
                          className="p-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-xl transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(level.id)}
                          className="p-3 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{level.description}</p>
                    
                    {/* Requirements Grid */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                            <Star className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Earned</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ₦{parseFloat(level.minEarnedAmount).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Jobs</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {level.minJobsCompleted}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Review Score</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {level.minReviewPercentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}