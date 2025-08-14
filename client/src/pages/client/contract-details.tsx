import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle, FileText, Calendar, DollarSign } from "lucide-react";
import ClientHeader from "@/components/client-header";
import StartConversationButton from "@/components/StartConversationButton";

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
  finder?: {
    name: string;
  };
  orderSubmission?: {
    id: string;
    submissionText?: string;
    attachmentPaths: string[];
    status: string;
    submittedAt: string;
  };
}

export default function ContractDetails() {
  const { contractId } = useParams<{ contractId: string }>();

  const { data: contract, isLoading } = useQuery<ContractDetails>({
    queryKey: ["/api/client/contracts", contractId],
    queryFn: () => fetch(`/api/client/contracts/${contractId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json()),
    enabled: !!contractId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader currentPage="contracts" />
        <div className="max-w-4xl mx-auto py-8 px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader currentPage="contracts" />
        <div className="max-w-4xl mx-auto py-8 px-6">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Not Found</h3>
              <p className="text-gray-600 mb-6">The contract you're looking for doesn't exist.</p>
              <Link href="/client/contracts">
                <Button>Back to Contracts</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="contracts" />

      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/client/contracts">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Details</h1>
          <p className="text-gray-600">Manage your contract with {contract.finder?.name || "Finder"}</p>
        </div>

        <div className="space-y-6">
          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{contract.request?.title || "Contract"}</span>
                <Badge 
                  variant={contract.isCompleted ? "default" : "secondary"}
                  className="ml-2"
                >
                  {contract.isCompleted && <CheckCircle className="w-3 h-3 mr-1" />}
                  {!contract.isCompleted && <Clock className="w-3 h-3 mr-1" />}
                  {contract.isCompleted ? "Completed" : "Active"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Contract Amount</p>
                    <p className="text-lg font-semibold text-green-600">${contract.amount}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="font-medium">{new Date(contract.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Submission Status</p>
                    <p className="font-medium">
                      {contract.hasSubmission ? "Submitted" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {contract.request?.description && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Project Description</h4>
                  <p className="text-gray-600">{contract.request.description}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <StartConversationButton 
                  proposalId={contract.proposalId}
                  finderName={contract.finder?.name || "Finder"}
                  variant="outline"
                />
                
                {contract.hasSubmission && (
                  <Link href={`/orders/review/${contract.id}`}>
                    <Button>
                      Review Submission
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submission Status */}
          {contract.hasSubmission && contract.orderSubmission ? (
            <Card>
              <CardHeader>
                <CardTitle>Work Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Submitted on {new Date(contract.orderSubmission.submittedAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">
                      {contract.orderSubmission.attachmentPaths.length} attachment(s)
                    </p>
                  </div>
                  <Badge 
                    variant={
                      contract.orderSubmission.status === "accepted" ? "default" :
                      contract.orderSubmission.status === "submitted" ? "secondary" : "destructive"
                    }
                  >
                    {contract.orderSubmission.status}
                  </Badge>
                </div>
                
                {contract.orderSubmission.submissionText && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-600 mb-1">Submission Note:</p>
                    <p>{contract.orderSubmission.submissionText}</p>
                  </div>
                )}

                <Link href={`/orders/review/${contract.id}`}>
                  <Button size="sm">
                    View Full Submission
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Waiting for Submission</h3>
                <p className="text-gray-600 mb-4">
                  {contract.finder?.name || "The finder"} hasn't submitted their work yet. You can message them for updates.
                </p>
                <StartConversationButton 
                  proposalId={contract.proposalId}
                  finderName={contract.finder?.name || "Finder"}
                  variant="outline"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}