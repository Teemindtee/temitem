import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { Upload, FileText, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";

interface Contract {
  id: string;
  requestId: string;
  amount: string;
  hasSubmission: boolean;
  isCompleted: boolean;
  createdAt: string;
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

export default function OrderSubmissionPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [submissionText, setSubmissionText] = useState("");
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ["/api/orders/contract", contractId],
    enabled: !!contractId,
  });

  const submitOrderMutation = useMutation({
    mutationFn: async (data: { contractId: string; submissionText?: string; attachmentPaths: string[] }) => {
      return apiRequest("/api/orders/submit", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Order submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/contract", contractId] });
      setSubmissionText("");
      setAttachmentPaths([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const data = await apiRequest("/api/objects/upload", {
      method: "POST"
    });
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    for (const file of result.successful || []) {
      if (file.uploadURL) {
        // Set ACL for the uploaded file
        try {
          const aclData = await apiRequest("/api/objects/acl", {
            method: "PUT",
            body: JSON.stringify({
              objectURL: file.uploadURL,
              visibility: "private"
            })
          });
          setAttachmentPaths(prev => [...prev, aclData.objectPath]);
          toast({ title: "File uploaded successfully!" });
        } catch (error: any) {
          toast({
            title: "Upload completed but failed to set permissions",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleSubmit = () => {
    if (!contractId) return;
    
    if (!submissionText?.trim() && attachmentPaths.length === 0) {
      toast({
        title: "Please add submission text or upload files",
        variant: "destructive",
      });
      return;
    }

    submitOrderMutation.mutate({
      contractId,
      submissionText: submissionText.trim() || undefined,
      attachmentPaths,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Contract not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order Submission</h1>

        <div className="grid gap-6">
        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Contract Amount</Label>
                <p className="text-lg font-semibold">₦{new Intl.NumberFormat('en-NG').format(parseFloat(contract.amount))}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">
                  {contract.hasSubmission ? (
                    <Badge variant="secondary">Has Submission</Badge>
                  ) : (
                    <Badge variant="outline">No Submission</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Created</Label>
                <p>{formatDate(contract.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Submission (if any) */}
        {contract.orderSubmission && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Submission</CardTitle>
                {getStatusBadge(contract.orderSubmission.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Submitted At</Label>
                <p className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(contract.orderSubmission.submittedAt)}
                </p>
              </div>
              
              {contract.orderSubmission.submissionText && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Submission Text</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-wrap">{contract.orderSubmission.submissionText}</p>
                  </div>
                </div>
              )}

              {contract.orderSubmission.attachmentPaths.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {contract.orderSubmission.attachmentPaths.map((path, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 mr-2" />
                        <a 
                          href={path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Attachment {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contract.orderSubmission.clientFeedback && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Client Feedback</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="whitespace-pre-wrap">{contract.orderSubmission.clientFeedback}</p>
                  </div>
                </div>
              )}

              {contract.orderSubmission.autoReleaseDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Auto-release Date</Label>
                  <p className="flex items-center mt-1 text-amber-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDate(contract.orderSubmission.autoReleaseDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit New/Updated Order */}
        {(!contract.orderSubmission || contract.orderSubmission.status === "rejected") && (
          <Card>
            <CardHeader>
              <CardTitle>
                {contract.orderSubmission ? "Resubmit Order" : "Submit Order"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="submission-text">Submission Description</Label>
                <Textarea
                  id="submission-text"
                  placeholder="Describe your completed work, provide instructions, or add any notes for the client..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div>
                <Label>File Attachments (Optional)</Label>
                <div className="mt-2 space-y-3">
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={10485760} // 10MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center justify-center py-3">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </div>
                  </ObjectUploader>

                  {attachmentPaths.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">
                        Selected Files ({attachmentPaths.length})
                      </Label>
                      {attachmentPaths.map((path, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="text-sm">Attachment {index + 1}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAttachmentPaths(prev => prev.filter((_, i) => i !== index))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitOrderMutation.isPending}
                className="w-full"
                size="lg"
              >
                {submitOrderMutation.isPending ? (
                  "Submitting..."
                ) : contract.orderSubmission ? (
                  "Resubmit Order"
                ) : (
                  "Submit Order"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}