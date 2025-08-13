import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, DollarSign, MapPin, Handshake, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Request, Proposal } from "@shared/schema";

export default function FinderRequestDetails() {
  const [match, params] = useRoute("/finder/requests/:id");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    approach: "",
    price: "",
    timeline: "",
    notes: ""
  });

  const requestId = params?.id;

  const { data: request, isLoading: requestLoading } = useQuery<Request>({
    queryKey: ['/api/requests', requestId],
    enabled: !!requestId && !!user
  });

  // For finders, only show their own proposals (like comments under a post)
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/finder/requests', requestId, 'proposals'],
    enabled: !!requestId && !!user && !!request
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const submitProposal = useMutation({
    mutationFn: async () => {
      if (!requestId) throw new Error("No request ID");
      return apiRequest("POST", "/api/proposals", {
        requestId,
        approach: proposalData.approach,
        price: proposalData.price,
        timeline: proposalData.timeline,
        notes: proposalData.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests', requestId, 'proposals'] });
      setShowProposalForm(false);
      setProposalData({ approach: "", price: "", timeline: "", notes: "" });
      toast({
        title: "Success!",
        description: "Your proposal has been submitted.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit proposal",
      });
    }
  });

  // Check if user already submitted a proposal for this request
  // Note: We'll need to get the finder ID from a separate query or user object structure
  const userProposal = proposals.find(p => p.finderId === user?.id);

  if (requestLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
          <Link href="/finder/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/finder/dashboard" className="hover:text-red-200">Dashboard</Link>
            <Link href="/finder/browse-requests" className="hover:text-red-200">Browse Requests</Link>
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-red-200">
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
        <Link href="/finder/browse-requests">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse Requests
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-8 px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">{request.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {request.timeframe || "Flexible timeline"}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Location flexible
                      </div>
                    </div>
                  </div>
                  <Badge variant={request.status === 'active' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{request.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Budget Range</h3>
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <DollarSign className="w-5 h-5 mr-1" />
                        ${request.budgetMin} - ${request.budgetMax}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Form or Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  {userProposal ? "Your Proposal" : "Submit Proposal"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProposal ? (
                  // Show existing proposal
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        userProposal.status === 'accepted' ? 'default' : 
                        userProposal.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {userProposal.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Submitted {userProposal.createdAt ? new Date(userProposal.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Approach</h4>
                      <p className="text-gray-700">{userProposal.approach}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-1">Price</h4>
                        <p className="text-gray-700">${userProposal.price}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Timeline</h4>
                        <p className="text-gray-700">{userProposal.timeline}</p>
                      </div>
                    </div>
                    {userProposal.notes && (
                      <div>
                        <h4 className="font-semibold mb-1">Additional Notes</h4>
                        <p className="text-gray-700">{userProposal.notes}</p>
                      </div>
                    )}
                  </div>
                ) : request.status === 'active' ? (
                  // Show proposal form
                  <div>
                    {!showProposalForm ? (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">
                          This request is available for proposals. Submit your proposal to be considered.
                        </p>
                        <Button onClick={() => setShowProposalForm(true)}>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Proposal
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        submitProposal.mutate();
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="approach">Approach *</Label>
                          <Textarea
                            id="approach"
                            placeholder="Describe your approach to this project..."
                            value={proposalData.approach}
                            onChange={(e) => setProposalData(prev => ({...prev, approach: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price *</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="Enter your price"
                              value={proposalData.price}
                              onChange={(e) => setProposalData(prev => ({...prev, price: e.target.value}))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="timeline">Timeline *</Label>
                            <Input
                              id="timeline"
                              placeholder="e.g. 2 weeks"
                              value={proposalData.timeline}
                              onChange={(e) => setProposalData(prev => ({...prev, timeline: e.target.value}))}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional information..."
                            value={proposalData.notes}
                            onChange={(e) => setProposalData(prev => ({...prev, notes: e.target.value}))}
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button type="submit" disabled={submitProposal.isPending}>
                            {submitProposal.isPending ? "Submitting..." : "Submit Proposal"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setShowProposalForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600">
                      This request is no longer accepting proposals.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Proposals:</span>
                  <span className="font-semibold">{proposals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Cost:</span>
                  <span className="font-semibold">{request.tokenCost} token{request.tokenCost !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-semibold">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}