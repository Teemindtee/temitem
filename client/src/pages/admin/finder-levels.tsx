import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Crown, Award, Navigation, Search, User, CheckCircle, Star, X } from "lucide-react";

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

  const { data: levels = [], isLoading } = useQuery<FinderLevel[]>({
    queryKey: ["/api/admin/finder-levels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/admin/finder-levels", { method: "POST", body: JSON.stringify(data) });
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
      return await apiRequest(`/api/admin/finder-levels/${id}`, { method: "PUT", body: JSON.stringify(data) });
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
      return await apiRequest(`/api/admin/finder-levels/${id}`, { method: "DELETE" });
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

    const cleanedData = {
      ...formData,
      minEarnedAmount: formData.minEarnedAmount || "0",
      minJobsCompleted: formData.minJobsCompleted || 0,
      minReviewPercentage: formData.minReviewPercentage || 0
    };

    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this finder level?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="finder-levels" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="finder-levels" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finder Levels</h1>
                <p className="text-sm text-gray-500">Manage performance tiers</p>
              </div>
            </div>

            {!isCreating && !editingLevel && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-semibold">{levels.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-lg font-semibold">{levels.filter(l => l.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Max Tier</p>
                  <p className="text-lg font-semibold">{levels.length > 0 ? Math.max(...levels.map(l => l.order)) : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Avg Score</p>
                  <p className="text-lg font-semibold">
                    {levels.length > 0 ? Math.round(levels.reduce((acc, l) => acc + l.minReviewPercentage, 0) / levels.length) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Modal */}
        {(isCreating || editingLevel) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {editingLevel ? 'Edit Finder Level' : 'Create New Level'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingLevel(null);
                      resetForm();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Level Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Novice, Expert"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this level..."
                    rows={3}
                    required
                  />
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minEarnedAmount">Min Earned (₦)</Label>
                    <Input
                      id="minEarnedAmount"
                      type="number"
                      value={formData.minEarnedAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minEarnedAmount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minJobsCompleted">Min Jobs</Label>
                    <Input
                      id="minJobsCompleted"
                      type="number"
                      value={formData.minJobsCompleted}
                      onChange={(e) => setFormData(prev => ({ ...prev, minJobsCompleted: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minReviewPercentage">Min Review (%)</Label>
                    <Input
                      id="minReviewPercentage"
                      type="number"
                      value={formData.minReviewPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, minReviewPercentage: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <select
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="User">👤 User</option>
                      <option value="Navigation">🧭 Navigation</option>
                      <option value="Search">🔍 Search</option>
                      <option value="Award">🏆 Award</option>
                      <option value="Crown">👑 Crown</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="isActive">Active Level</Label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {(createMutation.isPending || updateMutation.isPending) 
                      ? 'Saving...' 
                      : (editingLevel ? 'Update' : 'Create')
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingLevel(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Levels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {levels.map((level) => {
            const IconComponent = iconMap[level.icon as keyof typeof iconMap] || User;

            return (
              <Card key={level.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: level.color + '20', color: level.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{level.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={level.isActive ? "default" : "secondary"} className="text-xs">
                            Tier {level.order}
                          </Badge>
                          {level.isActive && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Active</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(level)}
                        className="p-2"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(level.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4">{level.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">Min Earned</span>
                      <span className="text-sm font-medium">₦{parseFloat(level.minEarnedAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">Min Jobs</span>
                      <span className="text-sm font-medium">{level.minJobsCompleted}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">Min Review</span>
                      <span className="text-sm font-medium">{level.minReviewPercentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {levels.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No finder levels yet</h3>
            <p className="text-gray-500 mb-4">Create your first finder level to get started.</p>
            <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Level
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}