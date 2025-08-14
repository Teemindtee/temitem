import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageCircle, Clock, CheckCircle, DollarSign } from "lucide-react";
import ClientHeader from "@/components/client-header";

interface Contract {
  id: string;
  requestId: string;
  finderId: string;
  proposalId: string;
  price: number;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  completedAt?: string;
  request?: {
    title: string;
    description: string;
  };
  finder?: {
    name: string;
  };
}

export default function ClientContracts() {
  const { user } = useAuth();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['/api/client/contracts'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="contracts" />

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contracts</h1>
          <p className="text-gray-600">Track your active and completed contracts with finders.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No contracts yet</h3>
              <p className="text-gray-600 mb-6">Start by posting a request and accepting proposals from finders.</p>
              <Link href="/client/requests/create">
                <Button>Post a Request</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract: Contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{contract.request?.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={
                            contract.status === "completed" ? "default" : 
                            contract.status === "active" ? "secondary" : "destructive"
                          }
                        >
                          {contract.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {contract.status === "active" && <Clock className="w-3 h-3 mr-1" />}
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          with {contract.finder?.name || "Finder"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        ${contract.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.status === "completed" && contract.completedAt ? 
                          `Completed ${new Date(contract.completedAt).toLocaleDateString()}` :
                          `Started ${new Date(contract.startDate).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {contract.request?.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <Link href={`/messages?proposalId=${contract.proposalId}`}>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Finder
                      </Button>
                    </Link>
                    
                    {contract.status === "active" && (
                      <Link href={`/client/contracts/${contract.id}`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                    )}
                    
                    {contract.status === "completed" && (
                      <Link href={`/client/contracts/${contract.id}/review`}>
                        <Button size="sm" variant="secondary">
                          Leave Review
                        </Button>
                      </Link>
                    )}
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