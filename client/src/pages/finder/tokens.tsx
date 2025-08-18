import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { 
  Wallet, 
  Plus, 
  Minus, 
  Clock, 
  TrendingUp, 
  DollarSign,
  CreditCard 
} from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function FindertokenBalance() {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/finder/transactions'],
    enabled: !!user
  });

  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  const currentBalance = finder?.findertokenBalance || 0;
  
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

  if (isLoading) {
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
                    <DollarSign className="w-6 h-6 text-green-600" />
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
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-2 hover:border-finder-red/30 cursor-pointer transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">10 Findertokens</div>
                    <div className="text-lg font-semibold text-finder-red mb-2">₦5,000</div>
                    <div className="text-sm text-gray-600 mb-3">Submit 10 proposals</div>
                    <Button 
                      className="w-full bg-finder-red hover:bg-finder-red-dark"
                      onClick={() => window.location.href = '/finder/token-purchase'}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-finder-red/30 bg-finder-red/10 relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-finder-red">Most Popular</Badge>
                  </div>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">25 Findertokens</div>
                    <div className="text-lg font-semibold text-finder-red mb-2">₦10,000</div>
                    <div className="text-sm text-gray-600 mb-3">Submit 25 proposals</div>
                    <Button 
                      className="w-full bg-finder-red hover:bg-finder-red-dark"
                      onClick={() => window.location.href = '/finder/token-purchase'}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-finder-red/30 cursor-pointer transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">50 Findertokens</div>
                    <div className="text-lg font-semibold text-finder-red mb-2">₦18,000</div>
                    <div className="text-sm text-gray-600 mb-3">Submit 50 proposals</div>
                    <Button 
                      className="w-full bg-finder-red hover:bg-finder-red-dark"
                      onClick={() => window.location.href = '/finder/token-purchase'}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
    </div>
  );
}