import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AdminHeader from "@/components/admin-header";
import { 
  Settings, 
  Save, 
  DollarSign, 
  Coins,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AdminSettings {
  proposalTokenCost: string;
  findertokenPrice: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [proposalTokenCost, setProposalTokenCost] = useState("");
  const [findertokenPrice, setFindertokenPrice] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch admin settings
  const { data: settings, isLoading: settingsLoading } = useQuery<AdminSettings>({
    queryKey: ['/api/admin/settings'],
    enabled: !!user && user.role === 'admin'
  });

  // Set initial values when settings are loaded
  useEffect(() => {
    if (settings) {
      setProposalTokenCost(settings.proposalTokenCost || "1");
      setFindertokenPrice(settings.findertokenPrice || "100");
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const hasTokenCostChange = proposalTokenCost !== (settings.proposalTokenCost || "1");
      const hasPriceChange = findertokenPrice !== (settings.findertokenPrice || "100");
      setHasChanges(hasTokenCostChange || hasPriceChange);
    }
  }, [proposalTokenCost, findertokenPrice, settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { proposalTokenCost?: string; findertokenPrice?: string }) => {
      return await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setHasChanges(false);
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  });

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      proposalTokenCost,
      findertokenPrice
    });
  };

  const findertokenPriceInNaira = parseFloat(findertokenPrice || "100") / 100;

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <AdminHeader currentPage="settings" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminHeader currentPage="settings" />
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-blue-600" />
            Platform Settings
          </h1>
          <p className="text-slate-600">Configure system-wide platform settings and pricing</p>
        </div>

        {/* Settings Form */}
        <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-slate-800 flex items-center text-xl">
              <Coins className="w-6 h-6 mr-3 text-orange-500" />
              Token Management
            </CardTitle>
            <CardDescription className="text-slate-600">
              Configure proposal costs and findertoken pricing for the platform
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleUpdateSettings} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Proposal Token Cost */}
                <div className="space-y-3">
                  <Label htmlFor="proposalCost" className="text-slate-700 text-sm font-semibold flex items-center">
                    <Coins className="w-4 h-4 mr-2 text-blue-600" />
                    Proposal Token Cost
                  </Label>
                  <Input
                    id="proposalCost"
                    type="number"
                    min="1"
                    max="100"
                    value={proposalTokenCost}
                    onChange={(e) => setProposalTokenCost(e.target.value)}
                    className="h-12 text-lg bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Enter token cost"
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Current:</strong> {proposalTokenCost || settings?.proposalTokenCost || "1"} tokens per proposal
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Number of tokens finders must spend to submit a proposal
                    </p>
                  </div>
                </div>

                {/* Findertoken Price */}
                <div className="space-y-3">
                  <Label htmlFor="tokenPrice" className="text-slate-700 text-sm font-semibold flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Findertoken Price (Kobo)
                  </Label>
                  <Input
                    id="tokenPrice"
                    type="number"
                    min="1"
                    max="10000"
                    value={findertokenPrice}
                    onChange={(e) => setFindertokenPrice(e.target.value)}
                    className="h-12 text-lg bg-white/80 border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                    placeholder="Enter price in kobo"
                  />
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>Current:</strong> ₦{findertokenPriceInNaira.toFixed(2)} per token
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Price users pay to purchase findertokens (100 kobo = ₦1)
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Pricing Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-slate-600" />
                  Current Configuration
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-2xl font-bold text-blue-600">{proposalTokenCost || "1"}</div>
                    <div className="text-slate-600">Tokens per proposal</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-2xl font-bold text-green-600">₦{findertokenPriceInNaira.toFixed(2)}</div>
                    <div className="text-slate-600">Price per token</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-2xl font-bold text-purple-600">₦{(findertokenPriceInNaira * parseFloat(proposalTokenCost || "1")).toFixed(2)}</div>
                    <div className="text-slate-600">Cost per proposal</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit"
                  size="lg"
                  disabled={updateSettingsMutation.isPending || !hasChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : hasChanges ? (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Settings Saved
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Token Economics</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Finders purchase tokens to submit proposals</li>
                  <li>• Each proposal submission costs tokens</li>
                  <li>• Token prices can be adjusted based on market demand</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Best Practices</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Keep proposal costs reasonable for finders</li>
                  <li>• Adjust token prices based on platform usage</li>
                  <li>• Monitor finder engagement after price changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}