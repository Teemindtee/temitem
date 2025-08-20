import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Clock, DollarSign, AlertCircle } from "lucide-react";
import type { WithdrawalRequest } from "@shared/schema";

export default function WithdrawalSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolder: "",
    minimumThreshold: "50"
  });

  const { data: withdrawalSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/finder/withdrawal-settings'],
    enabled: !!user
  });

  const { data: withdrawalHistory = [], isLoading: historyLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/finder/withdrawals'],
    enabled: !!user
  });

  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  // Update form data when withdrawal settings change
  useEffect(() => {
    if (withdrawalSettings && withdrawalSettings.bankDetails) {
      setFormData({
        bankName: withdrawalSettings.bankDetails.bankName || "",
        accountNumber: withdrawalSettings.bankDetails.accountNumber || "",
        routingNumber: withdrawalSettings.bankDetails.routingNumber || "",
        accountHolder: withdrawalSettings.bankDetails.accountHolder || "",
        minimumThreshold: withdrawalSettings.minimumThreshold?.toString() || "50"
      });
    }
  }, [withdrawalSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/finder/withdrawal-settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/withdrawal-settings'] });
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
    mutationFn: (data: { amount: number; paymentDetails: any }) => apiRequest('/api/finder/withdraw', { 
      method: 'POST',
      body: JSON.stringify({
        amount: data.amount,
        paymentMethod: 'Bank Transfer',
        paymentDetails: data.paymentDetails
      })
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

  const handleUpdateSettings = () => {
    const settingsData = {
      paymentMethod: "bank_transfer",
      minimumThreshold: parseInt(formData.minimumThreshold),
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        accountHolder: formData.accountHolder
      }
    };
    updateSettingsMutation.mutate(settingsData);
  };

  const handleWithdrawalRequest = () => {
    // Convert from kobo to naira for display, but send kobo to backend
    const availableBalanceKobo = Math.max(0, parseFloat(finder?.availableBalance || '0')); // Ensure positive balance
    const availableBalanceNaira = availableBalanceKobo / 100;
    const minimumThresholdNaira = parseInt(formData.minimumThreshold);
    const minimumThresholdKobo = minimumThresholdNaira * 100;
    
    // Check if balance is sufficient for minimum threshold
    if (availableBalanceKobo < minimumThresholdKobo) {
      toast({
        title: "Insufficient balance",
        description: `Minimum withdrawal amount is ₦${minimumThresholdNaira}. Available: ₦${availableBalanceNaira.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    // Calculate withdrawal fees (5% fee)
    const feePercentage = 0.05;
    const withdrawalFee = Math.round(availableBalanceKobo * feePercentage);
    const netAmount = availableBalanceKobo - withdrawalFee;
    
    // Double check net amount is positive
    if (netAmount <= 0) {
      toast({
        title: "Insufficient balance",
        description: `Available balance after fees would be ₦${(netAmount / 100).toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    const paymentDetails = {
      accountName: formData.accountHolder,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      routingNumber: formData.routingNumber
    };
    
    requestWithdrawalMutation.mutate({ 
      amount: netAmount,
      paymentDetails
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-finder-red/20 text-finder-red-dark';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (settingsLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
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
          <p className="text-gray-600 text-sm sm:text-base">Manage your bank account and withdrawal preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Available Balance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Available Balance</h3>
                  <p className="text-3xl font-bold text-green-600">
                    ₦{((Math.max(0, parseFloat(finder?.availableBalance || '0'))) / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    After 5% withdrawal fee: ₦{((Math.max(0, parseFloat(finder?.availableBalance || '0')) * 0.95) / 100).toFixed(2)}
                  </p>
                </div>
                <Button 
                  onClick={handleWithdrawalRequest}
                  disabled={!finder?.availableBalance || Math.max(0, parseFloat(finder.availableBalance)) < (parseInt(formData.minimumThreshold) * 100)}
                  className="bg-finder-red hover:bg-finder-red-dark"
                >
                  Request Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Bank Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bank Transfer Details */}
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="Enter bank name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                      placeholder="Enter account holder name"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={formData.routingNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                      placeholder="Enter routing number"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Threshold */}
              <div>
                <Label htmlFor="minimumThreshold">Minimum Withdrawal Amount</Label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="minimumThreshold"
                    type="number"
                    value={formData.minimumThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumThreshold: e.target.value }))}
                    className="pl-10"
                    min="10"
                    max="1000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum amount before you can request a withdrawal (between ₦10 - ₦1000)</p>
              </div>

              {/* Update Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleUpdateSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-finder-red hover:bg-finder-red-dark w-full sm:w-auto"
                >
                  {updateSettingsMutation.isPending ? "Updating..." : "Update Settings"}
                </Button>
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
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal history</h3>
                  <p className="text-gray-600">Your withdrawal requests will appear here once you make them.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">₦{(parseFloat(withdrawal.amount) / 100).toFixed(2)}</span>
                          </div>
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {withdrawal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Requested on {withdrawal.requestedAt ? new Date(withdrawal.requestedAt).toLocaleDateString() : 'Unknown'}
                          {withdrawal.processedAt && (
                            <span> • Processed on {new Date(withdrawal.processedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                        {withdrawal.adminNotes && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Admin Notes:</span> {withdrawal.adminNotes}
                          </p>
                        )}
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