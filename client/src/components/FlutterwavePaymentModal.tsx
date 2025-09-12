
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FlutterwavePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
  packagePrice: number;
  tokenCount: number;
  onPaymentSuccess: () => void;
}

function FlutterwavePaymentModal({
  isOpen,
  onClose,
  packageId,
  packageName,
  packagePrice,
  tokenCount,
  onPaymentSuccess
}: FlutterwavePaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'processing' | 'verifying' | 'success' | 'failed'>('form');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [reference, setReference] = useState('');

  // Payment verification mutation
  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      // Use role-specific endpoint based on current path
      let endpoint = `/api/payments/flutterwave/verify/${reference}`; // fallback
      
      if (window.location.pathname.includes('/client/')) {
        endpoint = `/api/client/tokens/flutterwave/verify/${reference}`;
      } else if (window.location.pathname.includes('/finder/')) {
        endpoint = `/api/finder/tokens/flutterwave/verify/${reference}`;
      }
        
      const response = await apiRequest(endpoint);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        setPaymentStatus('success');
        onPaymentSuccess();
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setPaymentStatus('failed');
      }
    },
    onError: () => {
      setPaymentStatus('failed');
    }
  });

  // Payment initialization mutation
  const initializePayment = useMutation({
    mutationFn: async ({ packageId, phone, customerName }: { packageId: string; phone: string; customerName: string }) => {
      // Use role-specific endpoint based on current path
      let endpoint = '/api/payments/flutterwave/initialize'; // fallback
      
      if (window.location.pathname.includes('/client/')) {
        endpoint = '/api/client/tokens/flutterwave/initialize';
      } else if (window.location.pathname.includes('/finder/')) {
        endpoint = '/api/finder/tokens/flutterwave/initialize';
      }
      
      console.log('Using endpoint:', endpoint, 'for path:', window.location.pathname);
        
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ packageId, phone, customerName })
      });
      return response;
    },
    onSuccess: (data) => {
      setPaymentUrl(data.authorization_url);
      setReference(data.reference);
      setPaymentStatus('processing');
      
      // Open Flutterwave payment page
      const paymentWindow = window.open(data.authorization_url, '_blank', 'width=600,height=600');
      
      if (paymentWindow) {
        // Poll for window closure
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            setPaymentStatus('verifying');
            verifyPayment.mutate(data.reference);
          }
        }, 1000);
      }
    },
    onError: () => {
      setPaymentStatus('failed');
    }
  });

  const resetForm = () => {
    setPhone('');
    setCustomerName('');
    setPaymentStatus('form');
    setPaymentUrl('');
    setReference('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      return;
    }
    initializePayment.mutate({ packageId, phone, customerName });
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
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            Pay with Flutterwave
          </DialogTitle>
          <DialogDescription>
            {packageName} - {tokenCount} FinderTokens for {formatCurrency(packagePrice)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {paymentStatus === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +2348012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-700">
                  <strong>Payment Summary:</strong><br />
                  Package: {packageName}<br />
                  Tokens: {tokenCount} FinderTokens<br />
                  Amount: {formatCurrency(packagePrice)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!customerName.trim() || initializePayment.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {initializePayment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Flutterwave
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  A payment window has been opened. Complete your payment and we'll automatically verify it.
                </p>
                {paymentUrl && (
                  <Button 
                    onClick={() => window.open(paymentUrl, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    Reopen Payment Window
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {paymentStatus === 'verifying' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Verifying Payment</h3>
                <p className="text-sm text-gray-600">
                  Please wait while we confirm your payment...
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
                <h3 className="font-semibold text-green-900 mb-2">Payment Successful!</h3>
                <p className="text-sm text-gray-600">
                  {tokenCount} FinderTokens have been added to your account.
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
                <h3 className="font-semibold text-red-900 mb-2">Payment Failed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  There was an issue processing your payment. Please try again.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setPaymentStatus('verifying');
                      verifyPayment.mutate(reference);
                    }}
                    variant="outline"
                    className="w-full"
                    disabled={!reference || verifyPayment.isPending}
                  >
                    {verifyPayment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Payment'
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      resetForm();
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { FlutterwavePaymentModal };
export default FlutterwavePaymentModal;
