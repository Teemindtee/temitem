import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Upload,
  FileText,
  User,
  Briefcase,
  AlertTriangle,
  Calculator,
  TrendingUp
} from "lucide-react";
import { ContractDisputeModal } from "@/components/ContractDisputeModal";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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

interface ContractDetails {
  id: string;
  requestId: string;
  proposalId: string;
  amount: string;
  escrowStatus: string;
  isCompleted: boolean;
  hasSubmission: boolean;
  createdAt: string;
  completedAt?: string;
  request?: {
    title: string;
    description: string;
  };
  orderSubmission?: {
    id: string;
    submissionText?: string;
    attachmentPaths: string[];
    status: string;
    submittedAt: string;
  };
}

export default function FinderContractDetails() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [match, params] = useRoute("/finder/contracts/:contractId");
  const contractId = params?.contractId;
  
  // Dispute modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const { data: contract, isLoading } = useQuery<ContractDetails>({
    queryKey: ['/api/finder/contracts', contractId],
    enabled: !!user && !!contractId
  });

  // Get admin settings for fee calculations
  const { data: adminSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: !!contract
  });

  // Calculate earnings with fee breakdown
  const calculateEarnings = () => {
    if (!contract || !adminSettings) return null;
    
    const contractAmount = parseFloat(contract.amount);
    const feePercentage = parseFloat(adminSettings.finderEarningsChargePercentage || '5');
    const feeAmount = contractAmount * (feePercentage / 100);
    const netEarnings = contractAmount - feeAmount;
    
    return {
      grossAmount: contractAmount,
      feeAmount,
      netEarnings,
      feePercentage
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading contract details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="max-w-4xl mx-auto py-8 px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('contract.contract_not_found')}</h1>
            <p className="text-gray-600 mb-6">{t('contract.contract_not_found_desc')}</p>
            <Link href="/finder/contracts">
              <Button>{t('navigation.contracts')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (contract: ContractDetails) => {
    if (contract.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">{t('contract.completed')}</Badge>;
    }
    if (contract.hasSubmission) {
      return <Badge className="bg-yellow-100 text-yellow-800">{t('contract.under_review')}</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">{t('contract.in_progress')}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />
      
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/finder/contracts">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')} {t('navigation.contracts')}
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {contract.request?.title || t('contract.contract_details')}
              </h1>
              <p className="text-gray-600">
                {t('contract.contract_id')}: {contract.id}
              </p>
            </div>
            {getStatusBadge(contract)}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                {t('contract.contract_overview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-600">{t('contract.contract_value')}</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(contract.amount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">{t('contract.started')}</p>
                    <p className="font-medium">{formatDate(contract.createdAt)}</p>
                  </div>
                </div>

                {contract.completedAt && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('contract.completed')}</p>
                      <p className="font-medium">{formatDate(contract.completedAt)}</p>
                      {contract.orderSubmission?.autoReleaseDate && (
                        <p className="text-xs text-gray-500">
                          Funds release: {formatDate(contract.orderSubmission.autoReleaseDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Project Description</h4>
                <p className="text-gray-600 leading-relaxed">
                  {contract.request?.description || 'No description available.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submission Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Work Submission
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contract.isCompleted ? (
                <div className="flex items-center space-x-3 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-medium">Work Completed</p>
                    <p className="text-sm text-gray-600">This contract has been successfully completed.</p>
                  </div>
                </div>
              ) : contract.hasSubmission ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-yellow-600">
                    <Clock className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Under Review</p>
                      <p className="text-sm text-gray-600">
                        Your work has been submitted and is being reviewed by the client.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link href={`/orders/submit/${contract.id}`}>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        View Submission Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-blue-600">
                    <Upload className="w-6 h-6" />
                    <div>
                      <p className="font-medium">Ready for Submission</p>
                      <p className="text-sm text-gray-600">
                        Complete your work and submit it for client review.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link href={`/orders/submit/${contract.id}`}>
                      <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Work
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Earnings Breakdown */}
          {calculateEarnings() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Earnings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">Contract Value</span>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(calculateEarnings()!.grossAmount)}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-600 font-medium">Platform Fee ({calculateEarnings()!.feePercentage}%)</span>
                    </div>
                    <p className="text-xl font-bold text-red-700">
                      -{formatCurrency(calculateEarnings()!.feeAmount)}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">Your Earnings</span>
                    </div>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(calculateEarnings()!.netEarnings)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    * Platform fee is automatically deducted from contract value. 
                    {contract.escrowStatus === 'released' ? 
                      'Earnings have been added to your available balance.' : 
                      contract.escrowStatus === 'completed' ?
                      'Earnings will be added to your balance once payment is released.' :
                      'Earnings will be calculated once work is completed and approved.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Escrow Information */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  contract.escrowStatus === 'released' ? 'bg-green-500' :
                  contract.escrowStatus === 'completed' ? 'bg-blue-500' :
                  contract.escrowStatus === 'in_progress' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div>
                  <p className="font-medium capitalize">
                    {contract.escrowStatus?.replace('_', ' ') || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {contract.escrowStatus === 'held' && 'Payment is securely held in escrow'}
                    {contract.escrowStatus === 'in_progress' && 'Work is in progress, payment held in escrow'}
                    {contract.escrowStatus === 'completed' && 'Work completed, payment ready for release'}
                    {contract.escrowStatus === 'released' && 'Payment has been released to you'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => setIsDisputeModalOpen(true)}
                  variant="outline" 
                  className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
                  data-testid="button-dispute-contract"
                >
                  <AlertTriangle className="w-4 h-4 mr-3" />
                  {t('dispute.report_issue')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dispute Modal */}
      <ContractDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        contractId={contractId || ''}
        contractTitle={contract?.request?.title}
      />
    </div>
  );
}