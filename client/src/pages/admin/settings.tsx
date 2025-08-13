import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Settings, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  DollarSign
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [proposalTokenCost, setProposalTokenCost] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<{ proposalTokenCost: string }>({
    queryKey: ['/api/admin/settings'],
    enabled: !!user && user.role === 'admin'
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiRequest('/api/admin/categories', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      setNewCategoryName("");
      setNewCategoryDesc("");
      toast({
        title: "Success",
        description: "Category created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive"
      });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { proposalTokenCost: string }) => {
      console.log('Sending API request with data:', data);
      return apiRequest('/api/admin/settings', { method: 'PUT', body: data });
    },
    onSuccess: (data) => {
      console.log('Settings update successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setProposalTokenCost(""); // Clear the local state to use the fetched value
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    },
    onError: (error: any) => {
      console.error('Settings update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    createCategoryMutation.mutate({
      name: newCategoryName,
      description: newCategoryDesc
    });
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const costValue = proposalTokenCost || settings?.proposalTokenCost || '1';
    console.log('Updating settings with:', { proposalTokenCost: costValue });
    updateSettingsMutation.mutate({
      proposalTokenCost: costValue
    });
  };

  if (categoriesLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="text-white hover:bg-red-700 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span className="text-xl font-bold">Admin Settings</span>
            </div>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Platform Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <Label htmlFor="tokenCost">Proposal Token Cost</Label>
                <Input
                  id="tokenCost"
                  type="number"
                  min="1"
                  value={proposalTokenCost || settings?.proposalTokenCost || '1'}
                  onChange={(e) => setProposalTokenCost(e.target.value)}
                  placeholder="Number of tokens required to submit a proposal"
                />
                <p className="text-sm text-gray-600 mt-1">
                  How many tokens finders need to spend to submit a proposal
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={updateSettingsMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {updateSettingsMutation.isPending ? "Updating..." : "Update Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories Management */}
        <Card>
          <CardHeader>
            <CardTitle>Category Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Create New Category */}
            <form onSubmit={handleCreateCategory} className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900">Add New Category</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDesc">Description</Label>
                  <Input
                    id="categoryDesc"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Brief description of the category"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={createCategoryMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createCategoryMutation.isPending ? "Creating..." : "Add Category"}
              </Button>
            </form>

            {/* Categories List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Existing Categories</h4>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No categories created yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {categories.map((category: Category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">{category.name}</h5>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Created: {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Category</DropdownMenuItem>
                            <DropdownMenuItem>
                              {category.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}