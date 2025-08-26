import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { SupportWidget } from "@/components/support-widget";
import { useAuth } from "@/hooks/use-auth";
import { Clock, CheckCircle, Upload, ExternalLink, MapPin, FileText, AlertCircle, TrendingUp, Calculator } from "lucide-react";

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

export default function FinderContracts() {
  const { user } = useAuth();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['/api/finder/contracts'],
    enabled: !!user
  });

  // Get admin settings for fee calculations
  const { data: adminSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: contracts.length > 0
  });

  console.log('Finder Contracts Data:', contracts); // Debug log

  // Calculate net earnings for a contract
  const calculateNetEarnings = (contractAmount: string) => {
    if (!adminSettings) return parseFloat(contractAmount);
    
    const amount = parseFloat(contractAmount);
    const feePercentage = parseFloat(adminSettings.finderEarningsChargePercentage || '5');
    const feeAmount = amount * (feePercentage / 100);
    return amount - feeAmount;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="contracts" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your contracts...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (contract: any) => {
    if (contract.isCompleted) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (contract.hasSubmission) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Under Review</Badge>;
    }
    return <Badge variant="default" className="bg-orange-100 text-orange-800">In Progress</Badge>;
  };

  const getEscrowStatusBadge = (status: string) => {
    switch (status) {
      case 'held':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Escrowed</Badge>;
      case 'released':
        return <Badge variant="default" className="bg-green-100 text-green-800">Released</Badge>;
      case 'disputed':
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="contracts" />

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Active Contracts</h1>
          <p className="text-gray-600">View and manage your ongoing work contracts and submissions.</p>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active contracts</h3>
              <p className="text-gray-600 mb-6">You don't have any active contracts at the moment. Start by browsing available opportunities and submitting proposals.</p>
              <Link href="/finder/browse-finds">
                <Button>Browse Available Finds</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {contracts.map((contract: any) => (
              <Link key={contract.id} href={`/finder/contracts/${contract.id}`}>
                <Card className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2 flex items-center">
                          {contract.request?.title || 'Contract Details'}
                          {!contract.hasSubmission && !contract.isCompleted && (
                            <AlertCircle className="w-5 h-5 text-orange-500 ml-2" title="Awaiting submission" />
                          )}
                        </CardTitle>
                        <p className="text-gray-600 line-clamp-2">
                          {contract.request?.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(contract)}
                        {getEscrowStatusBadge(contract.escrowStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                          <div className="flex items-center text-blue-600 text-sm">
                            <span className="font-medium">{formatCurrency(contract.amount)}</span>
                            <span className="ml-1 text-xs text-gray-500">(gross)</span>
                          </div>
                          {(contract.isCompleted || contract.escrowStatus === 'completed') && adminSettings && (
                            <div className="flex items-center text-green-600 text-sm font-semibold">
                              <Calculator className="w-3 h-3 mr-1" />
                              <span>{formatCurrency(calculateNetEarnings(contract.amount))}</span>
                              <span className="ml-1 text-xs text-gray-500">(earned)</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Started {new Date(contract.createdAt).toLocaleDateString()}
                        </div>
                        {contract.isCompleted && contract.completedAt && (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed {new Date(contract.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {contract.hasSubmission ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Upload className="w-3 h-3 mr-1" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            <Upload className="w-3 h-3 mr-1" />
                            Submit Work
                          </Badge>
                        )}
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SupportWidget context="contracts" />
    </div>
  );
}