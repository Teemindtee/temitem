import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, X, CreditCard, Clock, DollarSign, AlertCircle } from "lucide-react";
import type { WithdrawalRequest } from "@shared/schema";

export default function WithdrawalSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "bank_transfer",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolder: "",
    paypalEmail: "",
    minimumThreshold: "50"
  });

  const { data: withdrawalSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/finder/withdrawal-settings'],
    enabled: !!user
  });

  // Update form data when withdrawal settings change
  useEffect(() => {
    if (withdrawalSettings) {
      setFormData({
        paymentMethod: withdrawalSettings.paymentMethod || "bank_transfer",
        bankName: withdrawalSettings.bankDetails?.bankName || "",
        accountNumber: withdrawalSettings.bankDetails?.accountNumber || "",
        routingNumber: withdrawalSettings.bankDetails?.routingNumber || "",
        accountHolder: withdrawalSettings.bankDetails?.accountHolder || "",
        paypalEmail: withdrawalSettings.paypalDetails?.email || "",
        minimumThreshold: withdrawalSettings.minimumThreshold?.toString() || "50"
      });
    }
  }, [withdrawalSettings]);

  const { data: withdrawalHistory = [], isLoading: historyLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/finder/withdrawals'],
    enabled: !!user
  });

  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/finder/withdrawal-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/withdrawal-settings'] });
      setIsEditing(false);
      toast({
        title: "Settings updated",
        description: "Your withdrawal settings have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal settings",
        variant: "destructive",
      });
    },
  });

  const requestWithdrawalMutation = useMutation({
    mutationFn: (amount: number) => apiRequest('/api/finder/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/withdrawals'] });
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    const settingsData = {
      paymentMethod: formData.paymentMethod,
      minimumThreshold: parseInt(formData.minimumThreshold),
      ...(formData.paymentMethod === 'bank_transfer' ? {
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber,
          accountHolder: formData.accountHolder
        }
      } : {
        paypalDetails: {
          email: formData.paypalEmail
        }
      })
    };
    updateSettingsMutation.mutate(settingsData);
  };

  const handleWithdrawalRequest = () => {
    const availableBalance = finder?.totalEarnings || 0;
    if (availableBalance >= parseInt(formData.minimumThreshold)) {
      requestWithdrawalMutation.mutate(availableBalance);
    } else {
      toast({
        title: "Insufficient balance",
        description: `Minimum withdrawal amount is $${formData.minimumThreshold}`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (settingsLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading withdrawal settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />
      
      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Withdrawal Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your payment methods and withdrawal preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Available Balance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Available Balance</h3>
                  <p className="text-3xl font-bold text-green-600">${finder?.totalEarnings || 0}</p>
                  <p className="text-sm text-gray-600">Ready for withdrawal</p>
                </div>
                <Button 
                  onClick={handleWithdrawalRequest}
                  disabled={!finder?.totalEarnings || finder.totalEarnings < parseInt(formData.minimumThreshold)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Request Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Settings
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Settings
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={updateSettingsMutation.isPending}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                {isEditing ? (
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded border capitalize">
                    {formData.paymentMethod.replace('_', ' ')}
                  </p>
                )}
              </div>

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    {isEditing ? (
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                        className="mt-1"
                        placeholder="e.g., Chase Bank"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border">{formData.bankName || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder</Label>
                    {isEditing ? (
                      <Input
                        id="accountHolder"
                        value={formData.accountHolder}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                        className="mt-1"
                        placeholder="Full name on account"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border">{formData.accountHolder || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    {isEditing ? (
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="mt-1"
                        placeholder="Bank account number"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border">
                        {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    {isEditing ? (
                      <Input
                        id="routingNumber"
                        value={formData.routingNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="mt-1"
                        placeholder="Bank routing number"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border">{formData.routingNumber || "Not set"}</p>
                    )}
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'paypal' && (
                <div>
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  {isEditing ? (
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={formData.paypalEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, paypalEmail: e.target.value }))}
                      className="mt-1"
                      placeholder="your.email@paypal.com"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-gray-50 rounded border">{formData.paypalEmail || "Not set"}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="minimumThreshold">Minimum Withdrawal Amount ($)</Label>
                {isEditing ? (
                  <Input
                    id="minimumThreshold"
                    type="number"
                    value={formData.minimumThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumThreshold: e.target.value }))}
                    className="mt-1"
                    placeholder="50"
                    min="10"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-gray-50 rounded border">${formData.minimumThreshold}</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Withdrawals are processed within 3-5 business days</li>
                      <li>• All withdrawal requests require admin approval</li>
                      <li>• Minimum withdrawal amount is $10</li>
                      <li>• Processing fees may apply depending on payment method</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Withdrawal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalHistory.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawals yet</h3>
                  <p className="text-gray-600">Your withdrawal history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">${withdrawal.amount}</p>
                          <p className="text-sm text-gray-600">
                            Requested on {new Date(withdrawal.requestedAt || "").toLocaleDateString()}
                          </p>
                          {withdrawal.adminNotes && (
                            <p className="text-xs text-gray-500 mt-1">{withdrawal.adminNotes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}