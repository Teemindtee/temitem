import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wallet, 
  Plus, 
  Minus, 
  Clock, 
  TrendingUp, 
  DollarSign,
  CreditCard,
  Zap,
  Award
} from "lucide-react";
import type { Transaction, TokenPackage } from "@shared/schema";
import { FlutterwavePaymentModal } from "@/components/FlutterwavePaymentModal";

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

export default function FindertokenBalance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/finder/transactions'],
    enabled: !!user
  });

  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  const { data: tokenPackages = [], isLoading: packagesLoading } = useQuery<TokenPackage[]>({
    queryKey: ['/api/token-packages'],
    enabled: !!user
  });

  const currentBalance = (finder as any)?.findertokenBalance || 0;
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'findertoken_purchase': return <Plus className="w-4 h-4 text-green-600" />;
      case 'proposal': return <Minus className="w-4 h-4 text-finder-red" />;
      case 'refund': return <Plus className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'findertoken_purchase': return 'text-green-600';
      case 'proposal': return 'text-finder-red';
      case 'refund': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTransactionSign = (type: string) => {
    return type === 'findertoken_purchase' || type === 'refund' ? '+' : '';
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paystack' | 'flutterwave' | 'opay'>('paystack');
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    packageId: '',
    packageName: '',
    packagePrice: 0,
    tokenCount: 0
  });

  const handlePurchase = (tokenPackage: TokenPackage, method: 'paystack' | 'flutterwave' | 'opay') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase tokens",
        variant: "destructive"
      });
      return;
    }

    setPaymentModal({
      isOpen: true,
      packageId: tokenPackage.id,
      packageName: tokenPackage.name,
      packagePrice: typeof tokenPackage.price === 'string' ? parseFloat(tokenPackage.price) : tokenPackage.price,
      tokenCount: tokenPackage.tokenCount
    });
    setSelectedPaymentMethod(method);
  };

  if (transactionsLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading findertoken balance...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Findertoken Balance</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your proposal findertokens and view transaction history</p>
        </div>

        <div className="grid gap-6">
          {/* Balance Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Balance</p>
                    <p className="text-3xl font-bold text-gray-900">{currentBalance}</p>
                    <p className="text-sm text-gray-500">Proposal Findertokens</p>
                  </div>
                  <div className="p-3 bg-finder-red/20 rounded-full">
                    <Wallet className="w-6 h-6 text-finder-red" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Findertokens Used</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {transactions.filter(t => t.type === 'proposal').reduce((sum, t) => sum + Math.abs(t.amount), 0)}
                    </p>
                    <p className="text-sm text-gray-500">For Proposals</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Purchased</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {transactions.filter(t => t.type === 'findertoken_purchase').reduce((sum, t) => sum + t.amount, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Lifetime</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Tokens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Purchase Findertokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenPackages.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages available</h3>
                  <p className="text-gray-600">Check back later for token packages</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tokenPackages.map((tokenPackage, index) => (
                    <Card 
                      key={tokenPackage.id} 
                      className={`border-2 hover:border-finder-red/30 cursor-pointer transition-colors ${
                        index === 1 ? 'border-finder-red/30 bg-finder-red/10 relative' : ''
                      }`}
                    >
                      {index === 1 && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-finder-red">Most Popular</Badge>
                        </div>
                      )}
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {tokenPackage.tokenCount} Findertokens
                        </div>
                        <div className="text-lg font-semibold text-finder-red mb-2">
                          {formatCurrency(tokenPackage.price)}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {tokenPackage.description || `Submit ${tokenPackage.tokenCount} proposals`}
                        </div>
                        <div className="space-y-2">
                          <Button 
                            className="w-full bg-finder-red hover:bg-finder-red-dark"
                            onClick={() => handlePurchase(tokenPackage, 'paystack')}
                            disabled={purchasingPackage === tokenPackage.id}
                          >
                            {purchasingPackage === tokenPackage.id ? "Processing..." : "Pay with Paystack"}
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handlePurchase(tokenPackage, 'flutterwave')}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              Flutterwave
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handlePurchase(tokenPackage, 'opay')}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Opay
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <strong>Note:</strong> Each proposal submission costs findertokens as set by platform administrators. 
                Findertokens are non-refundable once used for proposals, but unused findertokens never expire.
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Findertoken History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-600">Your token purchases and usage will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.createdAt || "").toLocaleDateString()} at{" "}
                            {new Date(transaction.createdAt || "").toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                          {getTransactionSign(transaction.type)}{Math.abs(transaction.amount)} findertokens
                        </p>
                        <Badge variant={
                          transaction.type === 'findertoken_purchase' ? 'default' :
                          transaction.type === 'proposal' ? 'destructive' : 'secondary'
                        }>
                          {transaction.type.replace('findertoken_', '')}
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

      {/* Payment Modals */}
      {selectedPaymentMethod === 'flutterwave' && (
        <FlutterwavePaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
          packageId={paymentModal.packageId}
          packageName={paymentModal.packageName}
          packagePrice={paymentModal.packagePrice}
          tokenCount={paymentModal.tokenCount}
          onPaymentSuccess={() => {
            toast({
              title: "Payment successful!",
              description: `${paymentModal.tokenCount} FinderTokens have been added to your account.`,
            });
            setPaymentModal({ ...paymentModal, isOpen: false });
            // Refresh data
            window.location.reload();
          }}
        />
      )}

      
    </div>
  );
}