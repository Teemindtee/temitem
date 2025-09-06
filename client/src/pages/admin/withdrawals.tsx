import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Download,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WithdrawalRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import AdminHeader from "@/components/admin-header";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type SortField = 'requestedAt' | 'amount' | 'status' | 'finderName';
type SortDirection = 'asc' | 'desc';

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: withdrawals = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/withdrawals'],
    enabled: !!user && user.role === 'admin'
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
      return await apiRequest(`/api/admin/withdrawals/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ status, adminNotes }) 
      });
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

  // Format currency in Naira
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₦${(numAmount / 100).toFixed(2)}`;
  };

  // Sort function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort withdrawals
  const filteredAndSortedWithdrawals = useMemo(() => {
    let filtered = withdrawals.filter(withdrawal => {
      const matchesSearch = 
        withdrawal.finderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.finderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatCurrency(withdrawal.amount).includes(searchTerm) ||
        withdrawal.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'requestedAt':
          aVal = new Date(a.requestedAt).getTime();
          bVal = new Date(b.requestedAt).getTime();
          break;
        case 'amount':
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'finderName':
          aVal = a.finderName || '';
          bVal = b.finderName || '';
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [withdrawals, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredAndSortedWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Finder Name', 'Email', 'Amount', 'Status', 'Payment Method', 'Account Name', 'Account Number', 'Bank Name', 'Admin Notes'];
    const csvData = filteredAndSortedWithdrawals.map(w => {
      const paymentDetails = w.paymentDetails ? JSON.parse(w.paymentDetails) : {};
      return [
        new Date(w.requestedAt).toLocaleDateString(),
        w.finderName || '',
        w.finderEmail || '',
        formatCurrency(w.amount),
        w.status,
        w.paymentMethod || '',
        paymentDetails.accountName || '',
        paymentDetails.accountNumber || '',
        paymentDetails.bankName || '',
        w.adminNotes || ''
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...csvData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Withdrawals');
    XLSX.writeFile(workbook, `withdrawals_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Complete",
      description: "Withdrawals exported to Excel file successfully"
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Withdrawal Requests Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    const tableData = filteredAndSortedWithdrawals.map(w => {
      const paymentDetails = w.paymentDetails ? JSON.parse(w.paymentDetails) : {};
      return [
        new Date(w.requestedAt).toLocaleDateString(),
        w.finderName || '',
        formatCurrency(w.amount),
        w.status,
        paymentDetails.accountName || '',
        paymentDetails.bankName || ''
      ];
    });

    autoTable(doc, {
      head: [['Date', 'Finder', 'Amount', 'Status', 'Account Name', 'Bank']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] }
    });

    doc.save(`withdrawals_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "Export Complete", 
      description: "Withdrawals exported to PDF successfully"
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader currentPage="withdrawals" />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading withdrawal requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const processingWithdrawals = withdrawals.filter(w => w.status === 'processing');
  const completedWithdrawals = withdrawals.filter(w => ['approved', 'rejected'].includes(w.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="withdrawals" />

      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-finder-red rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Withdrawal Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Review and process finder withdrawal requests</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-2 flex-1 sm:flex-none">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span> CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm" className="flex items-center gap-2 flex-1 sm:flex-none">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="bg-yellow-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Pending</h3>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="bg-blue-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Processing</h3>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{processingWithdrawals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="bg-green-600 rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Approved</h3>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {withdrawals.filter(w => w.status === 'approved').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="bg-finder-red rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Rejected</h3>
              <p className="text-lg sm:text-2xl font-bold text-finder-red">
                {withdrawals.filter(w => w.status === 'rejected').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search withdrawals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests ({filteredAndSortedWithdrawals.length} of {withdrawals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedWithdrawals.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View - Hidden on Mobile */}
                <div className="hidden lg:block rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('requestedAt')}
                        >
                          <div className="flex items-center gap-2">
                            Date {getSortIcon('requestedAt')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('finderName')}
                        >
                          <div className="flex items-center gap-2">
                            Finder {getSortIcon('finderName')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('amount')}
                        >
                          <div className="flex items-center gap-2">
                            Amount {getSortIcon('amount')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status {getSortIcon('status')}
                          </div>
                        </TableHead>
                        <TableHead>Bank Details</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedWithdrawals.map((withdrawal: any) => {
                        const paymentDetails = withdrawal.paymentDetails ? JSON.parse(withdrawal.paymentDetails) : {};
                        return (
                          <TableRow key={withdrawal.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="text-sm">
                                {new Date(withdrawal.requestedAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(withdrawal.requestedAt).toLocaleTimeString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{withdrawal.finderName || 'N/A'}</div>
                              <div className="text-sm text-gray-600">{withdrawal.finderEmail}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(withdrawal.amount)}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {withdrawal.paymentMethod?.replace('_', ' ') || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(withdrawal.status)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{paymentDetails.accountName || 'N/A'}</div>
                                <div className="text-gray-600">{paymentDetails.accountNumber || 'N/A'}</div>
                                <div className="text-gray-600">{paymentDetails.bankName || 'N/A'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
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
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                      <DollarSign className="w-5 h-5 text-finder-red" />
                                      Process Withdrawal Request
                                    </DialogTitle>
                                  </DialogHeader>

                                  <div className="space-y-6">
                                    {/* Header Summary Card */}
                                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-finder-red">
                                      <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                          <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-finder-red rounded-full flex items-center justify-center">
                                              <span className="text-white font-bold text-lg">
                                                {selectedWithdrawal?.finderName?.charAt(0) || 'F'}
                                              </span>
                                            </div>
                                            <div>
                                              <h3 className="font-semibold text-lg text-gray-900">
                                                {selectedWithdrawal?.finderName || 'N/A'}
                                              </h3>
                                              <p className="text-sm text-gray-600">{selectedWithdrawal?.finderEmail}</p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                              {selectedWithdrawal && formatCurrency(selectedWithdrawal.amount)}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                              Requested: {selectedWithdrawal && new Date(selectedWithdrawal.requestedAt).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <div className="grid lg:grid-cols-2 gap-6">
                                      {/* Left Column - Bank Details */}
                                      <div className="space-y-4">
                                        <Card>
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                              <CreditCard className="w-4 h-4" />
                                              Bank Details
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div className="grid grid-cols-1 gap-3">
                                              <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Account Name:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                  {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).accountName || 'N/A' : 'N/A'}
                                                </span>
                                              </div>
                                              <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Account Number:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                  {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).accountNumber || 'N/A' : 'N/A'}
                                                </span>
                                              </div>
                                              <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Bank Name:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                  {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).bankName || 'N/A' : 'N/A'}
                                                </span>
                                              </div>
                                              <div className="flex justify-between py-2">
                                                <span className="text-sm font-medium text-gray-600">Sort Code:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                  {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).routingNumber || 'N/A' : 'N/A'}
                                                </span>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        <Card>
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Request Details</CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                                              <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
                                                {selectedWithdrawal?.paymentMethod?.replace('_', ' ') || 'N/A'}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-gray-600">Current Status:</span>
                                              <div>
                                                {selectedWithdrawal && getStatusBadge(selectedWithdrawal.status)}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>

                                      {/* Right Column - Actions */}
                                      <div className="space-y-4">
                                        <Card className="border-2 border-finder-red/20">
                                          <CardHeader className="pb-3">
                                            <CardTitle className="text-base text-finder-red">Update Status</CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div>
                                              <Label htmlFor="status" className="text-sm font-semibold">New Status</Label>
                                              <Select value={newStatus} onValueChange={setNewStatus}>
                                                <SelectTrigger className="mt-1 h-11">
                                                  <SelectValue placeholder="Select new status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="pending">
                                                    <div className="flex items-center gap-2">
                                                      <Clock className="w-4 h-4 text-yellow-600" />
                                                      Pending
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="processing">
                                                    <div className="flex items-center gap-2">
                                                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                                                      Processing
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="approved">
                                                    <div className="flex items-center gap-2">
                                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                                      Approved
                                                    </div>
                                                  </SelectItem>
                                                  <SelectItem value="rejected">
                                                    <div className="flex items-center gap-2">
                                                      <XCircle className="w-4 h-4 text-red-600" />
                                                      Rejected
                                                    </div>
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            <div>
                                              <Label htmlFor="notes" className="text-sm font-semibold">Admin Notes</Label>
                                              <Textarea
                                                id="notes"
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                placeholder="Add notes about this withdrawal decision..."
                                                rows={4}
                                                className="mt-1"
                                              />
                                              <p className="text-xs text-gray-500 mt-1">
                                                These notes will be visible to the finder
                                              </p>
                                            </div>

                                            {/* Prominent Action Buttons */}
                                            <div className="grid grid-cols-2 gap-3 pt-4">
                                              <Button
                                                variant="outline"
                                                onClick={() => setSelectedWithdrawal(null)}
                                                className="h-11"
                                              >
                                                Cancel
                                              </Button>
                                              <Button
                                                onClick={handleUpdateWithdrawal}
                                                disabled={updateWithdrawalMutation.isPending || !newStatus}
                                                className="bg-finder-red hover:bg-finder-red-dark h-11 font-semibold"
                                              >
                                                {updateWithdrawalMutation.isPending ? (
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Updating...
                                                  </div>
                                                ) : (
                                                  "Update Withdrawal"
                                                )}
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        {/* Quick Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setNewStatus('approved')}
                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Quick Approve
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setNewStatus('rejected')}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                          >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Quick Reject
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View - Hidden on Desktop */}
                <div className="lg:hidden space-y-3">
                  {paginatedWithdrawals.map((withdrawal: any) => {
                    const paymentDetails = withdrawal.paymentDetails ? JSON.parse(withdrawal.paymentDetails) : {};
                    return (
                      <Card key={withdrawal.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          {/* Header Row */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {withdrawal.finderName || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {withdrawal.finderEmail}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600 text-sm">
                                {formatCurrency(withdrawal.amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(withdrawal.requestedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Status and Payment Method */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(withdrawal.status)}
                              <span className="text-xs text-gray-500 capitalize">
                                {withdrawal.paymentMethod?.replace('_', ' ') || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Bank Details */}
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium text-gray-700 mb-1">Bank Details:</div>
                            <div className="space-y-0.5 text-gray-600">
                              <div><span className="font-medium">Name:</span> {paymentDetails.accountName || 'N/A'}</div>
                              <div><span className="font-medium">Account:</span> {paymentDetails.accountNumber || 'N/A'}</div>
                              <div><span className="font-medium">Bank:</span> {paymentDetails.bankName || 'N/A'}</div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openProcessDialog(withdrawal)}
                                  className="w-full"
                                >
                                  Process Withdrawal
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-finder-red" />
                                    Process Withdrawal Request
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6">
                                  {/* Header Summary Card */}
                                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-finder-red">
                                    <CardContent className="p-4">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-finder-red rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                              {selectedWithdrawal?.finderName?.charAt(0) || 'F'}
                                            </span>
                                          </div>
                                          <div>
                                            <h3 className="font-semibold text-lg text-gray-900">
                                              {selectedWithdrawal?.finderName || 'N/A'}
                                            </h3>
                                            <p className="text-sm text-gray-600">{selectedWithdrawal?.finderEmail}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-green-600">
                                            {selectedWithdrawal && formatCurrency(selectedWithdrawal.amount)}
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            Requested: {selectedWithdrawal && new Date(selectedWithdrawal.requestedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Left Column - Bank Details */}
                                    <div className="space-y-4">
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Bank Details
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="grid grid-cols-1 gap-3">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                              <span className="text-sm font-medium text-gray-600">Account Name:</span>
                                              <span className="text-sm font-semibold text-gray-900">
                                                {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).accountName || 'N/A' : 'N/A'}
                                              </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                              <span className="text-sm font-medium text-gray-600">Account Number:</span>
                                              <span className="text-sm font-semibold text-gray-900">
                                                {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).accountNumber || 'N/A' : 'N/A'}
                                              </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                              <span className="text-sm font-medium text-gray-600">Bank Name:</span>
                                              <span className="text-sm font-semibold text-gray-900">
                                                {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).bankName || 'N/A' : 'N/A'}
                                              </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                              <span className="text-sm font-medium text-gray-600">Sort Code:</span>
                                              <span className="text-sm font-semibold text-gray-900">
                                                {selectedWithdrawal?.paymentDetails ? JSON.parse(selectedWithdrawal.paymentDetails).routingNumber || 'N/A' : 'N/A'}
                                              </span>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base">Request Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                                            <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
                                              {selectedWithdrawal?.paymentMethod?.replace('_', ' ') || 'N/A'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Current Status:</span>
                                            <div>
                                              {selectedWithdrawal && getStatusBadge(selectedWithdrawal.status)}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Right Column - Actions */}
                                    <div className="space-y-4">
                                      <Card className="border-2 border-finder-red/20">
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-base text-finder-red">Update Status</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <Label htmlFor="status" className="text-sm font-semibold">New Status</Label>
                                            <Select value={newStatus} onValueChange={setNewStatus}>
                                              <SelectTrigger className="mt-1 h-11">
                                                <SelectValue placeholder="Select new status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="pending">
                                                  <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                    Pending
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="processing">
                                                  <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                                                    Processing
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="approved">
                                                  <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    Approved
                                                  </div>
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                  <div className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                    Rejected
                                                  </div>
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div>
                                            <Label htmlFor="notes" className="text-sm font-semibold">Admin Notes</Label>
                                            <Textarea
                                              id="notes"
                                              value={adminNotes}
                                              onChange={(e) => setAdminNotes(e.target.value)}
                                              placeholder="Add notes about this withdrawal decision..."
                                              rows={4}
                                              className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                              These notes will be visible to the finder
                                            </p>
                                          </div>

                                          {/* Prominent Action Buttons */}
                                          <div className="grid grid-cols-2 gap-3 pt-4">
                                            <Button
                                              variant="outline"
                                              onClick={() => setSelectedWithdrawal(null)}
                                              className="h-11"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={handleUpdateWithdrawal}
                                              disabled={updateWithdrawalMutation.isPending || !newStatus}
                                              className="bg-finder-red hover:bg-finder-red-dark h-11 font-semibold"
                                            >
                                              {updateWithdrawalMutation.isPending ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                  Updating...
                                                </div>
                                              ) : (
                                                "Update Withdrawal"
                                              )}
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Quick Action Buttons */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setNewStatus('approved')}
                                          className="text-green-600 border-green-200 hover:bg-green-50"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Quick Approve
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setNewStatus('rejected')}
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          Quick Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedWithdrawals.length)} of {filteredAndSortedWithdrawals.length}
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-xs sm:text-sm"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else {
                            if (currentPage <= 3) {
                              page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              page = totalPages - 4 + i;
                            } else {
                              page = currentPage - 2 + i;
                            }
                          }
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 p-0 text-xs ${currentPage === page ? "bg-finder-red hover:bg-finder-red-dark" : ""}`}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}