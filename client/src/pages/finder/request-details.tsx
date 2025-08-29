import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Banknote, MapPin, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Find, Proposal } from "@shared/schema";

export default function FinderRequestDetails() {
  // Support both old and new routes
  const [matchFinds, paramsFinds] = useRoute("/finder/finds/:id");
  const [matchRequests, paramsRequests] = useRoute("/finder/requests/:id");
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

  // Format currency in Naira
  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return '₦0';
    const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
    return `₦${numAmount.toLocaleString()}`;
  };

  const findId = paramsFinds?.id || paramsRequests?.id;

  const { data: find, isLoading: findLoading, error: findError } = useQuery<Find>({
    queryKey: ['/api/finds', findId],
    enabled: !!findId && !!user
  });



  // For finders, only show their own proposals (like comments under a post)
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ['/api/finder/finds', findId, 'proposals'],
    enabled: !!findId && !!user && !!find
  });

  const submitProposal = useMutation({
    mutationFn: async () => {
      if (!findId) throw new Error("No find ID");
      return apiRequest("/api/proposals", {
        method: "POST",
        body: JSON.stringify({
          findId: findId,
          approach: proposalData.approach,
          price: proposalData.price,
          timeline: proposalData.timeline,
          notes: proposalData.notes
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/finder/finds', findId, 'proposals'] });
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
  // Since we're using the finder-specific API that only returns their own proposals,
  // if proposals array has any item, it means the finder already submitted a proposal
  const userProposal = proposals.length > 0 ? proposals[0] : null;

  if (findLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!find) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Not Found</h1>
          <p className="text-gray-600 mb-4">Find ID: {findId}</p>
          {!user && <p className="text-gray-600 mb-4">Please log in to view this find</p>}
          {findError && <p className="text-gray-600 mb-4">Error: {findError?.message}</p>}
          <Link href="/finder/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto pt-4 sm:pt-6 px-4 sm:px-6">
        <Link href="/finder/browse-finds">
          <Button variant="ghost" className="mb-4 sm:mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse Finds
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-8 px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">{find.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {find.timeframe || "Flexible timeline"}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Location flexible
                      </div>
                    </div>
                  </div>
                  <Badge variant={find.status === 'open' ? 'default' : 'secondary'}>
                    {find.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{find.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                      <Badge variant="outline">{find.category}</Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Budget Range</h3>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(find.budgetMin)} - {formatCurrency(find.budgetMax)}
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
                        <p className="text-gray-700">₦{parseInt(userProposal.price || "0").toLocaleString()}</p>
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
                ) : find.status === 'open' ? (
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
                  <span className="text-gray-600">Findertoken Cost:</span>
                  <span className="font-semibold">{find.findertokenCost} findertoken{find.findertokenCost !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-semibold">
                    {find.createdAt ? new Date(find.createdAt).toLocaleDateString() : 'Unknown date'}
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