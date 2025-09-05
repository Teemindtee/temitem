
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "@/components/admin-header";
import { useAuth } from "@/hooks/use-auth";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Eye,
  Filter,
  Coins,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface Transaction {
  id: string;
  userId?: string;
  finderId?: string;
  amount: number;
  type: 'findertoken_purchase' | 'proposal' | 'escrow_funding' | 'withdrawal' | 'grant';
  description: string;
  reference?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  finder?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface WithdrawalRequest {
  id: string;
  finderId: string;
  amount: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  finder: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Contract {
  id: string;
  amount: string;
  escrowStatus: 'pending' | 'held' | 'released' | 'completed';
  createdAt: string;
  clientId: string;
  finderId: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  finder: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface FinancialSummary {
  totalRevenue: number;
  totalWithdrawals: number;
  pendingEscrow: number;
  tokenSales: number;
  dailyRevenue: Array<{ date: string; amount: number }>;
  weeklyRevenue: Array<{ week: string; amount: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
  yearlyRevenue: Array<{ year: string; amount: number }>;
}

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Fetch all financial data
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/admin/withdrawals'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/api/admin/contracts'],
    enabled: !!user && user.role === 'admin'
  });

  const isLoading = transactionsLoading || withdrawalsLoading || contractsLoading;

  // Filter transactions based on date and type
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    const now = new Date();
    
    // Date filtering
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return transactionDate >= today;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return transactionDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return transactionDate >= monthAgo;
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return transactionDate >= yearAgo;
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      return transactionDate >= startDate && transactionDate <= endDate;
    }
    
    // Type filtering
    if (transactionTypeFilter !== 'all') {
      return transaction.type === transactionTypeFilter;
    }
    
    return true;
  });

  // Calculate financial summary
  const financialSummary: FinancialSummary = {
    totalRevenue: filteredTransactions
      .filter(t => ['findertoken_purchase', 'escrow_funding'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalWithdrawals: withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + parseFloat(w.amount), 0),
    pendingEscrow: contracts
      .filter(c => c.escrowStatus === 'held')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0),
    tokenSales: filteredTransactions
      .filter(t => t.type === 'findertoken_purchase')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    dailyRevenue: [],
    weeklyRevenue: [],
    monthlyRevenue: [],
    yearlyRevenue: []
  };

  // Group transactions by time periods
  const groupTransactionsByPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const grouped = filteredTransactions
      .filter(t => ['findertoken_purchase', 'escrow_funding'].includes(t.type))
      .reduce((acc, transaction) => {
        const date = new Date(transaction.createdAt);
        let key: string;

        switch (period) {
          case 'daily':
            key = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = `Week of ${weekStart.toISOString().split('T')[0]}`;
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'yearly':
            key = date.getFullYear().toString();
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += Math.abs(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([key, amount]) => ({ [period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : period === 'yearly' ? 'year' : 'date']: key, amount }))
      .sort((a, b) => {
        const aKey = Object.keys(a)[0];
        const bKey = Object.keys(b)[0];
        return a[aKey].localeCompare(b[bKey]);
      });
  };

  const periodData = groupTransactionsByPeriod(viewMode);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'findertoken_purchase':
        return <Coins className="w-4 h-4 text-green-600" />;
      case 'escrow_funding':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'withdrawal':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'grant':
        return <ArrowUpRight className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportToCSV = () => {
    const csvData = filteredTransactions.map(transaction => ({
      Date: formatDate(transaction.createdAt),
      Type: transaction.type,
      Amount: transaction.amount,
      Description: transaction.description,
      User: transaction.user ? `${transaction.user.firstName} ${transaction.user.lastName}` : 
            transaction.finder ? `${transaction.finder.user.firstName} ${transaction.finder.user.lastName}` : 'N/A',
      Reference: transaction.reference || 'N/A'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-statement-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="financial" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="financial" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive financial overview and accounting statements</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters & Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <Label>Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === 'custom' && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Transaction Type</Label>
                <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="findertoken_purchase">Token Purchases</SelectItem>
                    <SelectItem value="escrow_funding">Escrow Funding</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="grant">Token Grants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={exportToCSV} className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialSummary.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Token Sales</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financialSummary.tokenSales)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Escrow</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(financialSummary.pendingEscrow)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialSummary.totalWithdrawals)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period-based Revenue Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Revenue by {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {periodData.map((item, index) => {
                const periodKey = Object.keys(item)[0];
                const period = item[periodKey];
                const amount = item.amount;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{period}</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Transaction Details</span>
              <Badge variant="outline">
                {filteredTransactions.length} transactions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.slice(0, 50).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <Badge variant={
                            transaction.type === 'findertoken_purchase' ? 'default' :
                            transaction.type === 'escrow_funding' ? 'secondary' :
                            transaction.type === 'withdrawal' ? 'destructive' :
                            'outline'
                          }>
                            {transaction.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.user ? (
                          <div>
                            <div className="font-medium">
                              {transaction.user.firstName} {transaction.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user.email}
                            </div>
                          </div>
                        ) : transaction.finder ? (
                          <div>
                            <div className="font-medium">
                              {transaction.finder.user.firstName} {transaction.finder.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.finder.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }>
                          {transaction.amount > 0 ? '+' : ''}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredTransactions.length > 50 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing first 50 transactions. Export CSV for complete data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
