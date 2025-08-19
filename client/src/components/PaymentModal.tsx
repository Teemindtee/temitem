import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, CreditCard, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  amount: number;
  paymentUrl: string;
  reference: string;
  findTitle: string;
  finderName: string;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  contractId,
  amount,
  paymentUrl,
  reference,
  findTitle,
  finderName,
  onPaymentSuccess
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');

  // Payment verification mutation
  const verifyPayment = useMutation({
    mutationFn: async ({ contractId, reference }: { contractId: string; reference: string }) => {
      const response = await apiRequest(`/api/contracts/${contractId}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify({ reference })
      });
      return response;
    },
    onSuccess: () => {
      setPaymentStatus('success');
      onPaymentSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: () => {
      setPaymentStatus('failed');
    }
  });

  const handlePayNow = () => {
    // Open Paystack payment page in new window
    const paymentWindow = window.open(paymentUrl, '_blank', 'width=600,height=600');
    
    if (paymentWindow) {
      // Poll for window closure (indicating payment completion)
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          // Start verification process
          setPaymentStatus('verifying');
          verifyPayment.mutate({ contractId, reference });
        }
      }, 1000);
    }
  };

  const handleVerifyPayment = () => {
    setPaymentStatus('verifying');
    verifyPayment.mutate({ contractId, reference });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Fund Contract Escrow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Details */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Find:</span>
                <span className="text-sm text-gray-900 text-right max-w-[200px]">{findTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Finder:</span>
                <span className="text-sm text-gray-900">{finderName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Escrow Amount:</span>
                <span className="text-lg font-bold text-finder-red">{formatCurrency(amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStatus === 'pending' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ready to Fund Escrow</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click "Pay Now" to securely fund the escrow through Paystack. 
                  The amount will be held safely until work is completed.
                </p>
                <Button 
                  onClick={handlePayNow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now with Paystack
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {paymentStatus === 'verifying' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Verifying Payment</h3>
                <p className="text-sm text-gray-600">
                  Please wait while we verify your payment...
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-sm text-gray-600">
                  Escrow has been funded successfully. The work can now begin.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Verification Failed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We couldn't verify your payment. If you completed the payment, please try verifying again.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleVerifyPayment}
                    variant="outline"
                    className="w-full"
                    disabled={verifyPayment.isPending}
                  >
                    {verifyPayment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Try Verify Again'
                    )}
                  </Button>
                  <Button 
                    onClick={handlePayNow}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Pay Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Close button */}
          {paymentStatus !== 'verifying' && paymentStatus !== 'success' && (
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}