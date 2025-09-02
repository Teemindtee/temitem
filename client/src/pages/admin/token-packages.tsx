import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import AdminHeader from '@/components/admin-header';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Coins,
  DollarSign,
  Hash,
  FileText
} from 'lucide-react';
import type { TokenPackage, InsertTokenPackage } from '@shared/schema';

// Helper function to format currency
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export default function TokenPackagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Remove getToken from useAuth hook
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertTokenPackage>>({
    name: '',
    description: '',
    price: '',
    tokenCount: 0,
    isActive: true
  });

  // Fetch token packages
  const { data: tokenPackages = [], isLoading } = useQuery<TokenPackage[]>({
    queryKey: ['/api/admin/token-packages']
  });

  // Create token package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (packageData: InsertTokenPackage) => {
      const response = await fetch('/api/admin/token-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('findermeister_token')}`
        },
        body: JSON.stringify(packageData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create token package');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-packages'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: "Success",
        description: "Token package created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update token package mutation
  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<TokenPackage> }) => {
      const response = await fetch(`/api/admin/token-packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('findermeister_token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update token package');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-packages'] });
      setEditingPackage(null);
      setEditModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Token package updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete token package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/token-packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('findermeister_token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete token package');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/token-packages'] });
      toast({
        title: "Success",
        description: "Token package deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      tokenCount: 0,
      isActive: true
    });
  };

  const startEdit = (pkg: TokenPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      tokenCount: pkg.tokenCount,
      isActive: pkg.isActive
    });
    setEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price || '0');
    const tokenCount = parseInt(formData.tokenCount?.toString() || '0');
    
    if (!formData.name || price <= 0 || tokenCount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    createPackageMutation.mutate({
      ...formData,
      price: price.toString(),
      tokenCount
    } as InsertTokenPackage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AdminHeader currentPage="token-packages" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading token packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <AdminHeader currentPage="token-packages" />
      
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-60"></div>
                <div className="relative p-3 sm:p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent break-words">
                  Token Packages
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
                  Manage token packages for finders
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm">Create Package</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center text-lg sm:text-xl">
                <Plus className="w-5 h-5 mr-2 text-green-600" />
                Create New Token Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center text-sm">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Package Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Bronze Tier, Mega Pack"
                      className="bg-white/80 w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenCount" className="flex items-center text-sm">
                      <Hash className="w-4 h-4 mr-2 text-orange-500" />
                      Number of Tokens *
                    </Label>
                    <Input
                      id="tokenCount"
                      type="number"
                      min="1"
                      value={formData.tokenCount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, tokenCount: parseInt(e.target.value) || 0 }))}
                      placeholder="e.g., 100"
                      className="bg-white/80 w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      Price (₦) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., 5000.00"
                      className="bg-white/80 w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center text-sm">
                      <Coins className="w-4 h-4 mr-2 text-purple-500" />
                      Active Status
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={formData.isActive || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <span className="text-sm text-gray-600 break-words">
                        {formData.isActive ? 'Active (available for purchase)' : 'Inactive (hidden from finders)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., 100 tokens to get you started"
                    className="bg-white/80 min-h-[100px] w-full resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    disabled={createPackageMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createPackageMutation.isPending 
                      ? "Saving..." 
                      : "Create Package"
                    }
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center text-lg sm:text-xl">
                <Edit className="w-5 h-5 mr-2 text-blue-600" />
                Edit Token Package
              </DialogTitle>
              <DialogDescription className="text-sm">
                Update the details of this token package. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const price = parseFloat(formData.price || '0');
              const tokenCount = parseInt(formData.tokenCount?.toString() || '0');
              
              if (!formData.name || price <= 0 || tokenCount <= 0) {
                toast({
                  title: "Validation Error",
                  description: "Please fill in all required fields with valid values",
                  variant: "destructive"
                });
                return;
              }

              if (editingPackage) {
                updatePackageMutation.mutate({
                  id: editingPackage.id,
                  data: {
                    ...formData,
                    price: price.toString(),
                    tokenCount
                  }
                });
              }
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    Package Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Bronze Tier, Mega Pack"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-tokenCount" className="flex items-center text-sm">
                    <Hash className="w-4 h-4 mr-2 text-orange-500" />
                    Token Count *
                  </Label>
                  <Input
                    id="edit-tokenCount"
                    type="number"
                    min="1"
                    value={formData.tokenCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenCount: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 100"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price" className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    Price (₦) *
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g., 5000.00"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center text-sm">
                    <Coins className="w-4 h-4 mr-2 text-purple-500" />
                    Active Status
                  </Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={formData.isActive || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <span className="text-sm text-gray-600 break-words">
                      {formData.isActive ? 'Active (available for purchase)' : 'Inactive (hidden from finders)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., 100 tokens to get you started"
                  className="min-h-[100px] w-full resize-none"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={updatePackageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updatePackageMutation.isPending ? "Updating..." : "Update Package"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="w-full sm:flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Token Packages List */}
        <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Token Packages ({tokenPackages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tokenPackages.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold mb-2">No token packages yet</h3>
                <p className="text-sm sm:text-base">Create your first token package to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {tokenPackages.map((pkg: TokenPackage) => (
                  <Card key={pkg.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200 w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 break-words flex-1 min-w-0">
                          {pkg.name}
                        </CardTitle>
                        <Badge variant={pkg.isActive ? "default" : "secondary"} className="shrink-0">
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pkg.description && (
                          <p className="text-gray-600 text-sm break-words">{pkg.description}</p>
                        )}
                        
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Price</span>
                            <span className="text-base sm:text-lg font-bold text-green-600 break-words">
                              {formatCurrency(pkg.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Tokens</span>
                            <span className="text-base sm:text-lg font-bold text-blue-600">{pkg.tokenCount}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-center">
                              <span className="text-xs text-gray-500">Price per token: </span>
                              <span className="text-xs sm:text-sm font-semibold text-orange-600 break-words">
                                {formatCurrency(parseFloat(pkg.price) / pkg.tokenCount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEdit(pkg)}
                            className="flex-1 w-full"
                            disabled={updatePackageMutation.isPending}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
                                deletePackageMutation.mutate(pkg.id);
                              }
                            }}
                            disabled={deletePackageMutation.isPending}
                            className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}