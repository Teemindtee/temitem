import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  DollarSign, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WithdrawalRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: withdrawals = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/withdrawals'],
    enabled: !!user && user.role === 'admin'
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
      return await apiRequest('PUT', `/api/admin/withdrawals/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      setSelectedWithdrawal(null);
      setNewStatus("");
      setAdminNotes("");
      toast({
        title: "Success",
        description: "Withdrawal request updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update withdrawal request",
        variant: "destructive"
      });
    }
  });

  const handleUpdateWithdrawal = () => {
    if (!selectedWithdrawal || !newStatus) return;
    
    updateWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      status: newStatus,
      adminNotes
    });
  };

  const openProcessDialog = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setAdminNotes(withdrawal.adminNotes || "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const processingWithdrawals = withdrawals.filter(w => w.status === 'processing');
  const completedWithdrawals = withdrawals.filter(w => ['approved', 'rejected'].includes(w.status));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-finder-red text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="text-white hover:bg-finder-red-dark p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-xl font-bold">Withdrawal Management</span>
            </div>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-finder-red">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Processing</h3>
              <p className="text-2xl font-bold text-blue-600">{processingWithdrawals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {withdrawals.filter(w => w.status === 'approved').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-finder-red rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rejected</h3>
              <p className="text-2xl font-bold text-finder-red">
                {withdrawals.filter(w => w.status === 'rejected').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Requests */}
        <Card>
          <CardHeader>
            <CardTitle>All Withdrawal Requests ({withdrawals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests</h3>
                <p className="text-gray-600">No finders have requested withdrawals yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {withdrawal.finder.user.firstName} {withdrawal.finder.user.lastName}
                          </h4>
                          <Badge variant={
                            withdrawal.status === 'pending' ? 'secondary' :
                            withdrawal.status === 'processing' ? 'default' :
                            withdrawal.status === 'approved' ? 'default' :
                            'destructive'
                          }>
                            {withdrawal.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{withdrawal.finder.user.email}</p>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">${withdrawal.amount}</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600 capitalize">
                              {withdrawal.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(withdrawal.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {withdrawal.adminNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700">
                              <strong>Admin Notes:</strong> {withdrawal.adminNotes}
                            </p>
                          </div>
                        )}

                        {withdrawal.processedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Processed: {new Date(withdrawal.processedAt).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openProcessDialog(withdrawal)}
                            >
                              Process
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Process Withdrawal Request</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Finder</Label>
                                <p className="text-sm text-gray-600">
                                  {selectedWithdrawal?.finder.user.firstName} {selectedWithdrawal?.finder.user.lastName}
                                </p>
                              </div>

                              <div>
                                <Label>Amount</Label>
                                <p className="font-semibold">${selectedWithdrawal?.amount}</p>
                              </div>

                              <div>
                                <Label>Payment Details</Label>
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {selectedWithdrawal?.paymentDetails ? 
                                    JSON.stringify(JSON.parse(selectedWithdrawal.paymentDetails), null, 2) : 
                                    'No details provided'
                                  }
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="notes">Admin Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes about this withdrawal request..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedWithdrawal(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateWithdrawal}
                                  disabled={updateWithdrawalMutation.isPending}
                                  className="bg-finder-red hover:bg-finder-red-dark"
                                >
                                  {updateWithdrawalMutation.isPending ? "Updating..." : "Update"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}