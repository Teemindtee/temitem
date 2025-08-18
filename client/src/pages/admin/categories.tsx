import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/admin-header";
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  Hash,
  Eye,
  Settings
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

export default function AdminCategoriesModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // New category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newCategoryActive, setNewCategoryActive] = useState(true);
  
  // Edit category form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editActive, setEditActive] = useState(true);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    enabled: !!user && user.role === 'admin'
  });

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description?: string; isActive: boolean }) => {
      return apiRequest('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      setNewCategoryName("");
      setNewCategoryDesc("");
      setNewCategoryActive(true);
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; description?: string; isActive: boolean }) => {
      return apiRequest(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: newCategoryDesc.trim() || undefined,
      isActive: newCategoryActive
    });
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    
    updateCategoryMutation.mutate({
      id: editingCategory.id,
      name: editName.trim(),
      description: editDesc.trim() || undefined,
      isActive: editActive
    });
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name || "");
    setEditDesc(category.description || "");
    setEditActive(category.isActive ?? true);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
    setEditDesc("");
    setEditActive(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AdminHeader currentPage="categories" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeCategories = categories.filter(c => c.isActive).length;
  const inactiveCategories = categories.filter(c => !c.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="categories" />
      
      {/* Modern Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-60"></div>
                <div className="relative p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <Tag className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Category Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  Organize and manage service categories for your platform
                </p>
              </div>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Category
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Web Development"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      placeholder="Brief description of the category"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={newCategoryActive}
                      onCheckedChange={setNewCategoryActive}
                    />
                    <Label htmlFor="active" className="text-sm font-normal">
                      Active (visible to users)
                    </Label>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCategoryMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Categories</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Hash className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Categories</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeCategories}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Inactive Categories</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{inactiveCategories}</p>
                  </div>
                  <div className="p-3 bg-red-500/10 text-red-600 rounded-xl">
                    <XCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Usage Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">85%</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:bg-white dark:focus:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Categories Table */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">All Categories</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage service categories and their visibility</p>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? "No categories found" : "No categories yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm 
                    ? `No categories match "${searchTerm}". Try a different search term.`
                    : "Create your first category to organize services on your platform."
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Category
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                        <td className="px-4 py-4">
                          {editingCategory?.id === category.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="font-semibold"
                              required
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                {category.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {category.name}
                                </h3>
                              </div>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-4 py-4">
                          {editingCategory?.id === category.id ? (
                            <Textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                              {category.description || "No description provided"}
                            </p>
                          )}
                        </td>
                        
                        <td className="px-4 py-4">
                          {editingCategory?.id === category.id ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={editActive}
                                onCheckedChange={setEditActive}
                              />
                              <Label className="text-sm font-normal">
                                {editActive ? "Active" : "Inactive"}
                              </Label>
                            </div>
                          ) : (
                            <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              category.isActive 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              <div className="flex items-center gap-1">
                                {category.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {category.isActive ? "Active" : "Inactive"}
                              </div>
                            </Badge>
                          )}
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 text-right">
                          {editingCategory?.id === category.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="p-2"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleUpdateCategory}
                                disabled={updateCategoryMutation.isPending}
                                className="p-2 bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="p-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 rounded-lg">
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditCategory(category)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={deleteCategoryMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}