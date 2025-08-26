import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Handshake, Clock, Banknote, CheckCircle, XCircle, Calendar } from "lucide-react";
import type { Proposal } from "@shared/schema";

export default function FinderProposals() {
  const { user, logout } = useAuth();

  const { data: proposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/finder/proposals'],
    enabled: !!user
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-finder-red" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your proposals...</p>
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
            <span className="bg-white text-finder-red px-3 py-1 rounded font-medium">My Proposals</span>
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
        <Link href="/finder/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
          <p className="text-gray-600">Track the status of all your submitted proposals.</p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Total Proposals</h3>
              <p className="text-2xl font-bold text-blue-600">{proposals.length}</p>
              <p className="text-gray-600 text-sm">All time</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {proposals.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-gray-600 text-sm">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Accepted</h3>
              <p className="text-2xl font-bold text-green-600">
                {proposals.filter(p => p.status === 'accepted').length}
              </p>
              <p className="text-gray-600 text-sm">Ready to start</p>
            </CardContent>
          </Card>

          <Card className="border-finder-red/30">
            <CardContent className="p-6 text-center">
              <div className="bg-finder-red rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rejected</h3>
              <p className="text-2xl font-bold text-finder-red">
                {proposals.filter(p => p.status === 'rejected').length}
              </p>
              <p className="text-gray-600 text-sm">Not selected</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">All Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-6">Start by browsing available finds and submitting your first proposal.</p>
                <Link href="/finder/browse-finds">
                  <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                    Browse Finds
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(proposal.status || 'pending')}
                          <h3 className="font-semibold text-gray-900">Request #{proposal.requestId.slice(-8)}</h3>
                          {getStatusBadge(proposal.status || 'pending')}
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">{proposal.approach}</p>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Banknote className="w-4 h-4 mr-1" />
                            <span>Proposed: ₦{proposal.price}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Timeline: {proposal.timeline}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Submitted: {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </div>

                        {proposal.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Additional Notes:</strong> {proposal.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 flex gap-2">
                        <Link href={`/finder/proposals/${proposal.id}`}>
                          <Button size="sm" className="bg-finder-red hover:bg-finder-red-dark text-white">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/finder/requests/${proposal.requestId}`}>
                          <Button variant="outline" size="sm">
                            View Request
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}