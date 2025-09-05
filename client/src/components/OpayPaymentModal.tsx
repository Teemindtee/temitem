
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, ExternalLink, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
  packagePrice: number;
  tokenCount: number;
  onPaymentSuccess: () => void;
}

export function OpayPaymentModal({
  isOpen,
  onClose,
  packageId,
  packageName,
  packagePrice,
  tokenCount,
  onPaymentSuccess
}: OpayPaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'processing' | 'verifying' | 'success' | 'failed'>('form');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [reference, setReference] = useState('');

  // Payment initialization mutation
  const initializePayment = useMutation({
    mutationFn: async ({ packageId, phone }: { packageId: string; phone: string }) => {
      const response = await apiRequest('/api/payments/opay/initialize', {
        method: 'POST',
        body: JSON.stringify({ packageId, phone })
      });
      return response;
    },
    onSuccess: (data) => {
      setPaymentUrl(data.authorization_url);
      setReference(data.reference);
      setPaymentStatus('processing');
      
      // Open Opay payment page
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

  // Payment verification mutation
  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      const response = await apiRequest(`/api/payments/opay/verify/${reference}`);
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        setPaymentStatus('success');
        onPaymentSuccess();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setPaymentStatus('failed');
      }
    },
    onError: () => {
      setPaymentStatus('failed');
    }
  });

  const handleInitializePayment = () => {
    if (!phone || phone.length < 10) {
      return;
    }
    initializePayment.mutate({ packageId, phone });
  };

  const handleVerifyPayment = () => {
    if (reference) {
      setPaymentStatus('verifying');
      verifyPayment.mutate(reference);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format Nigerian phone number
    if (digits.startsWith('234')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return '234' + digits.substring(1);
    } else if (digits.length <= 10) {
      return '234' + digits;
    }
    return digits;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            Pay with Opay
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Details */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Package:</span>
                <span className="text-sm text-gray-900 font-semibold">{packageName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Tokens:</span>
                <span className="text-sm text-gray-900">{tokenCount} FinderTokens</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(packagePrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {paymentStatus === 'form' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Enter your Nigerian phone number for payment verification
                </p>
              </div>
              
              <Button 
                onClick={handleInitializePayment}
                disabled={!phone || phone.length < 13 || initializePayment.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {initializePayment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay with Opay
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-sm text-gray-600">
                  Please complete your payment in the Opay window that opened.
                </p>
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
                <h3 className="font-semibold text-gray-900 mb-2">Payment Failed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We couldn't complete your payment. Please try again.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleVerifyPayment}
                    variant="outline"
                    className="w-full"
                    disabled={verifyPayment.isPending || !reference}
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
                    onClick={() => setPaymentStatus('form')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Close button */}
          {paymentStatus !== 'verifying' && paymentStatus !== 'success' && paymentStatus !== 'processing' && (
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
