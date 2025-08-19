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
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
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

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-finder-red rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
                <p className="text-gray-600">Review and process finder withdrawal requests</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Export CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Processing</h3>
              <p className="text-2xl font-bold text-blue-600">{processingWithdrawals.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {withdrawals.filter(w => w.status === 'approved').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-finder-red rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rejected</h3>
              <p className="text-2xl font-bold text-finder-red">
                {withdrawals.filter(w => w.status === 'rejected').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by finder name, email, amount, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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
                <div className="rounded-lg border overflow-hidden">
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
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Process Withdrawal Request</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Label>Finder</Label>
                                        <p className="text-sm text-gray-600">
                                          {selectedWithdrawal?.finderName || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {selectedWithdrawal?.finderEmail}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Amount</Label>
                                        <p className="font-semibold text-green-600">
                                          {selectedWithdrawal && formatCurrency(selectedWithdrawal.amount)}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <Label>Bank Details</Label>
                                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                        {selectedWithdrawal?.paymentDetails ? (() => {
                                          const details = JSON.parse(selectedWithdrawal.paymentDetails);
                                          return (
                                            <div className="space-y-1">
                                              <div><strong>Account Name:</strong> {details.accountName || 'N/A'}</div>
                                              <div><strong>Account Number:</strong> {details.accountNumber || 'N/A'}</div>
                                              <div><strong>Bank Name:</strong> {details.bankName || 'N/A'}</div>
                                              <div><strong>Sort Code:</strong> {details.sortCode || 'N/A'}</div>
                                            </div>
                                          );
                                        })() : 'No bank details provided'}
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="status">Status</Label>
                                      <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="processing">Processing</SelectItem>
                                          <SelectItem value="approved">Approved</SelectItem>
                                          <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label htmlFor="notes">Admin Notes</Label>
                                      <Textarea
                                        id="notes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes about this withdrawal request..."
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setSelectedWithdrawal(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleUpdateWithdrawal}
                                        disabled={updateWithdrawalMutation.isPending}
                                        className="bg-finder-red hover:bg-finder-red-dark"
                                      >
                                        {updateWithdrawalMutation.isPending ? "Updating..." : "Update"}
                                      </Button>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedWithdrawals.length)} of {filteredAndSortedWithdrawals.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-finder-red hover:bg-finder-red-dark" : ""}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
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