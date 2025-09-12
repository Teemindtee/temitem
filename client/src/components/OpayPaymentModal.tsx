import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

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
            Payment Service Unavailable
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

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Service Unavailable</h3>
              <p className="text-sm text-gray-600">
                Payment services have been removed from this platform. Please contact support for token purchases.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}