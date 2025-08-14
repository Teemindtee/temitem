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
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Upload,
  FileText,
  User,
  Briefcase
} from "lucide-react";

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
  const [match, params] = useRoute("/finder/contracts/:contractId");
  const contractId = params?.contractId;

  const { data: contract, isLoading } = useQuery<ContractDetails>({
    queryKey: ['/api/finder/contracts', contractId],
    enabled: !!user && !!contractId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Not Found</h1>
            <p className="text-gray-600 mb-6">The contract you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/finder/contracts">
              <Button>Back to Contracts</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (contract: ContractDetails) => {
    if (contract.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (contract.hasSubmission) {
      return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
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
              Back to Contracts
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {contract.request?.title || 'Contract Details'}
              </h1>
              <p className="text-gray-600">
                Contract ID: {contract.id}
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
                Contract Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Contract Value</p>
                    <p className="text-xl font-semibold text-green-600">${contract.amount}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Started</p>
                    <p className="font-medium">{formatDate(contract.createdAt)}</p>
                  </div>
                </div>

                {contract.completedAt && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="font-medium">{formatDate(contract.completedAt)}</p>
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
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Work
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
}