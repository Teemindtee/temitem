
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

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

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Services Unavailable</h3>
              <p className="text-sm text-gray-600">
                Payment services have been removed from this platform. Please contact support for assistance with escrow funding.
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
