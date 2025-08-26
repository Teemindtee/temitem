import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Handshake, Clock, Banknote, CheckCircle, XCircle, Calendar, MessageSquare } from "lucide-react";
import type { Proposal, Request } from "@shared/schema";

export default function FinderProposalDetails() {
  const [match, params] = useRoute("/finder/proposals/:id");
  const { user, logout } = useAuth();
  const proposalId = params?.id;

  const { data: proposal, isLoading: proposalLoading } = useQuery<Proposal>({
    queryKey: ['/api/proposals', proposalId],
    enabled: !!proposalId && !!user
  });

  const { data: request, isLoading: requestLoading } = useQuery<Request>({
    queryKey: ['/api/requests', proposal?.requestId],
    enabled: !!proposal?.requestId && !!user
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-finder-red" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  if (proposalLoading || requestLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h1>
          <Link href="/finder/proposals">
            <Button>Back to My Proposals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-finder-red text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/finder/dashboard" className="hover:text-finder-red/70">Dashboard</Link>
            <Link href="/finder/browse-requests" className="hover:text-finder-red/70">Browse Requests</Link>
            <Link href="/finder/proposals" className="hover:text-finder-red/70">My Proposals</Link>
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-finder-red/70">
                <span>{user?.firstName} {user?.lastName}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible group-hover:visible">
                <button 
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Sign out
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto pt-6 px-6">
        <Link href="/finder/proposals">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Proposals
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-8 px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Proposal Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(proposal.status || 'pending')}
                      <CardTitle className="text-2xl text-gray-900">Your Proposal</CardTitle>
                      {getStatusBadge(proposal.status || 'pending')}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Submitted: {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Your Approach</h3>
                    <p className="text-gray-700 leading-relaxed">{proposal.approach}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Proposed Price</h3>
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <Banknote className="w-5 h-5 mr-1" />
₦{proposal.price}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                      <div className="flex items-center text-lg font-semibold text-blue-600">
                        <Clock className="w-5 h-5 mr-1" />
                        {proposal.timeline}
                      </div>
                    </div>
                  </div>

                  {proposal.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{proposal.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            {request && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{request.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{request.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Category</h4>
                        <Badge variant="outline">{request.category}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Client Budget</h4>
                        <div className="flex items-center text-gray-700">
                          <Banknote className="w-4 h-4 mr-1" />
₦{request.budgetMin} - ₦{request.budgetMax}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href={`/finder/requests/${request.id}`}>
                        <Button variant="outline" className="w-full">
                          View Full Request Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposal Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(proposal.status || 'pending')}
                    <span className="font-semibold capitalize">{proposal.status || 'pending'}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-semibold">
                    {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Proposal ID:</span>
                  <span className="font-mono text-xs text-gray-500">
                    {proposal.id.slice(-8)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {proposal.status === 'accepted' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">🎉 Congratulations!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Your proposal has been accepted! The client is ready to work with you on this project.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Client
                  </Button>
                </CardContent>
              </Card>
            )}

            {proposal.status === 'rejected' && (
              <Card className="mt-6 border-finder-red/30">
                <CardHeader>
                  <CardTitle className="text-lg text-finder-red-dark">Proposal Not Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Unfortunately, your proposal was not selected for this project. Don't get discouraged - keep submitting great proposals!
                  </p>
                  <Link href="/finder/browse-requests">
                    <Button variant="outline" className="w-full">
                      Browse More Requests
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {proposal.status === 'pending' && (
              <Card className="mt-6 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-700">Under Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Your proposal is currently being reviewed by the client. You'll be notified once they make a decision.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}