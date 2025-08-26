import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Calendar, Clock, CheckCircle, XCircle, Download, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ClientHeader from "@/components/client-header";

interface Contract {
  id: string;
  requestId: string;
  finderId: string;
  amount: string;
  hasSubmission: boolean;
  isCompleted: boolean;
  createdAt: string;
  finder?: {
    name: string;
    email?: string;
    rating?: string;
  };
  orderSubmission?: {
    id: string;
    submissionText?: string;
    attachmentPaths: string[];
    status: string;
    clientFeedback?: string;
    submittedAt: string;
    reviewedAt?: string;
    autoReleaseDate?: string;
  };
}

export default function OrderReviewPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ["/api/orders/contract", contractId],
    enabled: !!contractId,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to get latest submission
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: async (data: { submissionId: string; status: string; clientFeedback?: string }) => {
      return apiRequest(`/api/orders/submission/${data.submissionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: data.status,
          clientFeedback: data.clientFeedback,
        })
      });
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.status === 'accepted' 
          ? "Order accepted successfully!" 
          : "Order rejected - finder can resubmit"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/contract", contractId] });
      setFeedback("");
      setShowAcceptDialog(false);
      setShowRejectDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to review submission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = async () => {
    if (!contract?.orderSubmission?.id || !contract?.finder) return;
    
    // First accept the submission
    reviewSubmissionMutation.mutate({
      submissionId: contract.orderSubmission.id,
      status: "accepted",
      clientFeedback: feedback.trim() || undefined,
    });
    
    // Then create the review/rating
    try {
      await apiRequest('/api/reviews', {
        method: 'POST',
        body: {
          contractId: contract.id,
          finderId: contract.finderId,
          rating: rating,
          comment: feedback.trim() || undefined
        }
      });
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast({
        title: "Rating submission failed",
        description: "Your order was accepted but rating could not be saved",
        variant: "destructive",
      });
    }
  };

  const handleReject = () => {
    if (!contract?.orderSubmission?.id) return;
    
    if (!feedback.trim()) {
      toast({
        title: "Please provide feedback for rejection",
        variant: "destructive",
      });
      return;
    }

    reviewSubmissionMutation.mutate({
      submissionId: contract.orderSubmission.id,
      status: "rejected",
      clientFeedback: feedback.trim(),
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysUntilAutoRelease = (autoReleaseDate?: string) => {
    if (!autoReleaseDate) return null;
    
    const now = new Date();
    const releaseDate = new Date(autoReleaseDate);
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Contract not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contract.orderSubmission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No submission found for this contract</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilRelease = getDaysUntilAutoRelease(contract.orderSubmission.autoReleaseDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="contracts" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Review Order Submission</h1>

        <div className="grid gap-6">
        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Contract Amount</Label>
                <p className="text-lg font-semibold">{formatCurrency(contract.amount)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(contract.orderSubmission.status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Finder</Label>
                <p className="text-sm font-semibold">{contract.finder?.name || "Unknown Finder"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Contract Created</Label>
                <p>{formatDate(contract.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-release Warning */}
        {contract.orderSubmission.status === "submitted" && daysUntilRelease !== null && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900">Auto-release Notice</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    {daysUntilRelease > 0 
                      ? `Funds will be automatically released to the finder in ${daysUntilRelease} day${daysUntilRelease > 1 ? 's' : ''} if no decision is made.`
                      : "Funds will be automatically released today if no decision is made."
                    }
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Auto-release date: {formatDate(contract.orderSubmission.autoReleaseDate!)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Submission Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Submission Details</CardTitle>
              <div className="text-sm text-gray-500">
                Submitted on {formatDate(contract.orderSubmission.submittedAt)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {contract.orderSubmission.submissionText && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Submission Description</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap">{contract.orderSubmission.submissionText}</p>
                </div>
              </div>
            )}

            {contract.orderSubmission.attachmentPaths.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Attachments ({contract.orderSubmission.attachmentPaths.length})
                </Label>
                <div className="mt-3 space-y-2">
                  {contract.orderSubmission.attachmentPaths.map((path, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-gray-500" />
                        <span className="font-medium">Attachment {index + 1}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contract.orderSubmission.clientFeedback && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Previous Feedback</Label>
                <div className="mt-2 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <p className="whitespace-pre-wrap text-blue-900">{contract.orderSubmission.clientFeedback}</p>
                  {contract.orderSubmission.reviewedAt && (
                    <p className="text-xs text-blue-700 mt-2">
                      Reviewed on {formatDate(contract.orderSubmission.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Actions */}
        {contract.orderSubmission.status === "submitted" && (
          <Card>
            <CardHeader>
              <CardTitle>Review Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Section */}
              <div>
                <Label>Rate {contract.finder?.name || "the finder"}'s work</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (Optional for acceptance, required for rejection)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide feedback to the finder about their submission..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                {/* Accept Dialog */}
                <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Submission
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept Order Submission</AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-2">Your rating for {contract.finder?.name || "the finder"}:</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p>Are you sure you want to accept this submission? This will:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Mark the request as completed</li>
                              <li>Release funds to the finder in 3 days</li>
                              <li>Complete the contract</li>
                              <li>Submit your {rating}-star rating</li>
                            </ul>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleAccept}
                        disabled={reviewSubmissionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {reviewSubmissionMutation.isPending ? "Processing..." : "Accept Submission"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Reject Dialog */}
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Changes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Request Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reject the submission and allow the finder to resubmit with changes.
                        Please make sure you've provided clear feedback above.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleReject}
                        disabled={reviewSubmissionMutation.isPending || !feedback.trim()}
                        className="bg-finder-red hover:bg-finder-red-dark"
                      >
                        {reviewSubmissionMutation.isPending ? "Processing..." : "Request Changes"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <strong>Note:</strong> If you accept the submission, funds will be automatically released to the finder after 3 days.
                If you don't make a decision, funds will be automatically released after 5 days from submission.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Status */}
        {contract.orderSubmission.status === "accepted" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Order Completed</h3>
                  <p className="text-sm text-green-800 mt-1">
                    This submission has been accepted and the request is now completed.
                  </p>
                  {contract.orderSubmission.reviewedAt && (
                    <p className="text-xs text-green-700 mt-1">
                      Accepted on {formatDate(contract.orderSubmission.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}