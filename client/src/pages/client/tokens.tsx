import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ClientHeader from "@/components/client-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Wallet,
  Plus,
  Minus,
  Clock,
  TrendingUp,
  Banknote,
  CreditCard,
  Zap,
  Award,
  Star
} from "lucide-react";
import type { Transaction, TokenPackage } from "@shared/schema";
import FlutterwavePaymentModal from "@/components/FlutterwavePaymentModal";

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

export default function ClientTokens() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);
  const [flutterwaveModal, setFlutterwaveModal] = useState<{
    isOpen: boolean;
    packageId: string;
    packageName: string;
    packagePrice: number;
    tokenCount: number;
  }>({
    isOpen: false,
    packageId: '',
    packageName: '',
    packagePrice: 0,
    tokenCount: 0
  });

  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/client/transactions'],
    enabled: !!user
  });

  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['/api/client/balance'],
    enabled: !!user
  });

  const { data: tokenPackages = [], isLoading: packagesLoading } = useQuery<TokenPackage[]>({
    queryKey: ['/api/token-packages'],
    enabled: !!user
  });

  const currentBalance = (balanceData as any)?.balance || 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'findertoken_purchase': return <Plus className="w-4 h-4 text-green-600" />;
      case 'find_posting': return <Minus className="w-4 h-4 text-finder-red" />;
      case 'refund': return <Plus className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'findertoken_purchase': return 'text-green-600';
      case 'find_posting': return 'text-finder-red';
      case 'refund': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTransactionSign = (type: string) => {
    return type === 'findertoken_purchase' || type === 'refund' ? '+' : '-';
  };

  const handlePurchasePackage = async (packageId: string) => {
    const packageToPurchase = tokenPackages.find(pkg => pkg.id === packageId);
    if (!packageToPurchase) {
      toast({
        title: "Error",
        description: "Package not found",
        variant: "destructive",
      });
      return;
    }

    // Open Flutterwave payment modal
    setFlutterwaveModal({
      isOpen: true,
      packageId: packageToPurchase.id,
      packageName: packageToPurchase.name,
      packagePrice: parseFloat(packageToPurchase.price),
      tokenCount: packageToPurchase.tokenCount
    });
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: "Tokens have been added to your account",
    });
    refetchBalance();
    refetchTransactions();
  };

  if (transactionsLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ClientHeader currentPage="tokens" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading token information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ClientHeader currentPage="tokens" />

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-8 w-8 text-finder-red" />
          <h1 className="text-3xl font-bold text-gray-900">Findertoken Balance</h1>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-finder-red to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentBalance} Tokens</div>
              <p className="text-red-100 text-sm">Available for posting finds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
                <TrendingUp className="w-5 h-5" />
                Total Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {transactions
                  .filter(t => t.type === 'findertoken_purchase')
                  .reduce((sum, t) => sum + t.amount, 0)} Tokens
              </div>
              <p className="text-gray-600 text-sm">Lifetime purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
                <Banknote className="w-5 h-5" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {transactions
                  .filter(t => t.type === 'find_posting')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)} Tokens
              </div>
              <p className="text-gray-600 text-sm">Used for posting finds</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Purchase Findertokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenPackages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No token packages available</p>
              ) : (
                <div className="grid gap-3">
                  {tokenPackages
                    .filter(pkg => pkg.isActive)
                    .map((tokenPackage) => (
                      <div
                        key={tokenPackage.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`token-package-${tokenPackage.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{tokenPackage.name}</h3>
                            {tokenPackage.name.toLowerCase().includes('popular') && (
                              <Badge variant="default" className="bg-finder-red">
                                <Star className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{tokenPackage.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              {tokenPackage.tokenCount} Tokens
                            </span>
                            <span className="font-medium text-finder-red">
                              {formatCurrency(tokenPackage.price)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <Button
                            onClick={() => handlePurchasePackage(tokenPackage.id)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            size="lg"
                            data-testid={`purchase-button-${tokenPackage.id}`}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Purchase with Flutterwave
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.type === 'findertoken_purchase' && 'Token Purchase'}
                            {transaction.type === 'find_posting' && 'Find Posted'}
                            {transaction.type === 'refund' && 'Refund'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                          {getTransactionSign(transaction.type)}{transaction.amount} tokens
                        </p>
                        {(transaction as any).metadata?.price && (
                          <p className="text-xs text-gray-500">
                            {formatCurrency((transaction as any).metadata.price)}
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

      <FlutterwavePaymentModal
        isOpen={flutterwaveModal.isOpen}
        onClose={() => setFlutterwaveModal(prev => ({ ...prev, isOpen: false }))}
        packageId={flutterwaveModal.packageId}
        packageName={flutterwaveModal.packageName}
        packagePrice={flutterwaveModal.packagePrice}
        tokenCount={flutterwaveModal.tokenCount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}