import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

    if (editingPackage) {
      updatePackageMutation.mutate({
        id: editingPackage.id,
        data: {
          ...formData,
          price: price.toString(),
          tokenCount
        }
      });
    } else {
      createPackageMutation.mutate({
        ...formData,
        price: price.toString(),
        tokenCount
      } as InsertTokenPackage);
    }
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-60"></div>
                <div className="relative p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Token Packages
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Manage token packages for finders</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Package
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create/Edit Form */}
        {(isCreating || editingPackage) && (
          <Card className="mb-8 backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center">
                {editingPackage ? <Edit className="w-5 h-5 mr-2 text-blue-600" /> : <Plus className="w-5 h-5 mr-2 text-green-600" />}
                {editingPackage ? 'Edit Token Package' : 'Create New Token Package'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Package Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Bronze Tier, Mega Pack"
                      className="bg-white/80"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenCount" className="flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-orange-500" />
                      Number of Tokens *
                    </Label>
                    <Input
                      id="tokenCount"
                      type="number"
                      min="1"
                      value={formData.tokenCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, tokenCount: parseInt(e.target.value) || 0 }))}
                      placeholder="e.g., 100"
                      className="bg-white/80"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center">
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
                      className="bg-white/80"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Coins className="w-4 h-4 mr-2 text-purple-500" />
                      Active Status
                    </Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <span className="text-sm text-gray-600">
                        {formData.isActive ? 'Active (available for purchase)' : 'Inactive (hidden from finders)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., 100 tokens to get you started"
                    className="bg-white/80 min-h-[100px]"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createPackageMutation.isPending || updatePackageMutation.isPending 
                      ? "Saving..." 
                      : editingPackage ? "Update Package" : "Create Package"
                    }
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingPackage(null);
                      resetForm();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

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
                <p>Create your first token package to get started.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tokenPackages.map((pkg: TokenPackage) => (
                  <Card key={pkg.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900">{pkg.name}</CardTitle>
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pkg.description && (
                          <p className="text-gray-600 text-sm">{pkg.description}</p>
                        )}
                        
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Price</span>
                            <span className="text-lg font-bold text-green-600">{formatCurrency(pkg.price)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Tokens</span>
                            <span className="text-lg font-bold text-blue-600">{pkg.tokenCount}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-center">
                              <span className="text-xs text-gray-500">Price per token: </span>
                              <span className="text-sm font-semibold text-orange-600">
                                {formatCurrency(parseFloat(pkg.price) / pkg.tokenCount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEdit(pkg)}
                            className="flex-1"
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
                            className="text-red-600 border-red-200 hover:bg-red-50"
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