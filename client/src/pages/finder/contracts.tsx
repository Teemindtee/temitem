import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { DollarSign, Clock, CheckCircle, Upload, ExternalLink } from "lucide-react";

interface Contract {
  id: string;
  requestId: string;
  amount: number;
  escrowStatus: string;
  isCompleted: boolean;
  hasSubmission: boolean;
  createdAt: string;
  request: {
    title: string;
    description: string;
  };
}

export default function FinderContracts() {
  const { user } = useAuth();

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['/api/finder/contracts'],
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="contracts" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your contracts...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (contract: Contract) => {
    if (contract.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (contract.hasSubmission) {
      return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="contracts" />

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contracts</h1>
          <p className="text-gray-600">Manage your active projects and submit completed work.</p>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
              <p className="text-gray-600 mb-6">When clients accept your proposals, contracts will appear here.</p>
              <Link href="/finder/dashboard">
                <Button>View Available Requests</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {contracts.map((contract) => (
              <Card key={contract.id} className="border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {contract.request.title}
                      </CardTitle>
                      <p className="text-gray-600 line-clamp-2">
                        {contract.request.description}
                      </p>
                    </div>
                    {getStatusBadge(contract)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-green-600">
                        <DollarSign className="w-5 h-5 mr-1" />
                        <span className="font-semibold text-lg">${contract.amount}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        Started {getTimeAgo(contract.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {contract.isCompleted ? (
                        <Button variant="outline" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : contract.hasSubmission ? (
                        <div className="flex space-x-2">
                          <Button variant="outline" disabled>
                            <Clock className="w-4 h-4 mr-2" />
                            Under Review
                          </Button>
                          <Link href={`/orders/submit/${contract.id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Submission
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/orders/submit/${contract.id}`}>
                          <Button className="bg-red-600 hover:bg-red-700 text-white">
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Work
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}