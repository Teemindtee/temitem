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
import { Plus, Edit, Trash2, Crown, Award, Navigation, Search, User } from "lucide-react";

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
    minEarnedAmount: "0",
    minJobsCompleted: 0,
    minReviewPercentage: 0,
    icon: "User",
    iconUrl: "",
    color: "#6b7280",
    order: 1,
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ['/api/admin/finder-levels'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/finder-levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/finder-levels'] });
      setIsCreating(false);
      resetForm();
      toast({ title: "Success", description: "Finder level created successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/admin/finder-levels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/finder-levels'] });
      setEditingLevel(null);
      resetForm();
      toast({ title: "Success", description: "Finder level updated successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/finder-levels/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/finder-levels'] });
      toast({ title: "Success", description: "Finder level deleted successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      minEarnedAmount: "0",
      minJobsCompleted: 0,
      minReviewPercentage: 0,
      icon: "User",
      iconUrl: "",
      color: "#6b7280",
      order: (levels as FinderLevel[]).length + 1,
      isActive: true
    });
  };

  const handleEdit = (level: FinderLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description || "",
      minEarnedAmount: level.minEarnedAmount,
      minJobsCompleted: level.minJobsCompleted,
      minReviewPercentage: level.minReviewPercentage,
      icon: level.icon,
      iconUrl: level.iconUrl || "",
      color: level.color,
      order: level.order,
      isActive: level.isActive
    });
    setIsCreating(true);
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
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finder Levels Management</h1>
          <p className="text-gray-600">Manage finder performance levels and requirements</p>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingLevel) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingLevel ? 'Edit Finder Level' : 'Create New Finder Level'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    min="1"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this finder level..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="minEarnedAmount">Minimum Earned Amount (₦)</Label>
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
                  <Label htmlFor="minJobsCompleted">Minimum Jobs Completed</Label>
                  <Input
                    id="minJobsCompleted"
                    type="number"
                    value={formData.minJobsCompleted}
                    onChange={(e) => setFormData(prev => ({ ...prev, minJobsCompleted: parseInt(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="minReviewPercentage">Minimum Review Score (%)</Label>
                  <Input
                    id="minReviewPercentage"
                    type="number"
                    value={formData.minReviewPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, minReviewPercentage: parseInt(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="User">User</option>
                    <option value="Navigation">Navigation</option>
                    <option value="Search">Search</option>
                    <option value="Award">Award</option>
                    <option value="Crown">Crown</option>
                  </select>
                  
                  <div className="text-sm text-gray-600">
                    Or upload a custom icon:
                  </div>
                  
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={2097152}
                    buttonClassName="w-full"
                    onGetUploadParameters={async () => {
                      const response = await fetch('/api/objects/upload', { method: 'POST' });
                      const data = await response.json();
                      return { method: 'PUT' as const, url: data.uploadURL };
                    }}
                    onComplete={(result: UploadResult) => {
                      if (result.successful.length > 0) {
                        const uploadURL = result.successful[0].uploadURL;
                        if (uploadURL) {
                          // Convert the upload URL to a normalized object path
                          const normalizedPath = uploadURL.replace(/\?.*$/, '').replace(/^https:\/\/[^\/]+/, '');
                          const objectPath = `/objects${normalizedPath.split('/.private/uploads/')[1] || normalizedPath}`;
                          setFormData(prev => ({ 
                            ...prev, 
                            iconUrl: objectPath 
                          }));
                          toast({ 
                            title: "Success", 
                            description: "Icon uploaded successfully" 
                          });
                        }
                      }
                    }}
                  >
                    Upload Custom Icon
                  </ObjectUploader>
                  
                  {formData.iconUrl && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <img 
                        src={formData.iconUrl} 
                        alt="Custom icon" 
                        className="w-6 h-6 object-cover rounded" 
                      />
                      <span className="text-green-700 text-sm">Custom icon uploaded</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, iconUrl: "" }))}
                        className="ml-auto h-6 w-6 p-0 text-green-700 hover:bg-green-100"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingLevel ? 'Update Level' : 'Create Level'}
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
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!isCreating && !editingLevel && (
          <div className="mb-6">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Level
            </Button>
          </div>
        )}

        {/* Levels List */}
        <div className="grid gap-6">
          {(levels as FinderLevel[]).map((level: FinderLevel) => {
            const IconComponent = iconMap[level.icon as keyof typeof iconMap] || User;
            
            return (
              <Card key={level.id} className="border-l-4" style={{ borderLeftColor: level.color }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div 
                        className="p-3 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: level.color + '20', color: level.color }}
                      >
                        {level.iconUrl ? (
                          <img 
                            src={level.iconUrl} 
                            alt={level.name} 
                            className="w-6 h-6 object-cover rounded"
                          />
                        ) : (
                          <IconComponent className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{level.name}</h3>
                          <Badge 
                            variant={level.isActive ? "default" : "secondary"}
                            style={{ backgroundColor: level.isActive ? level.color : undefined }}
                          >
                            Order: {level.order}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{level.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Min Earned:</span>
                            <div className="font-semibold">₦{parseFloat(level.minEarnedAmount).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Min Jobs:</span>
                            <div className="font-semibold">{level.minJobsCompleted} jobs</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Min Score:</span>
                            <div className="font-semibold">{level.minReviewPercentage}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(level)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(level.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}