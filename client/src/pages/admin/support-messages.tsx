
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin-header";
import { 
  MessageSquare, 
  Reply, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Calendar,
  Filter,
  Search,
  Send,
  Trash2
} from "lucide-react";

interface SupportMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200"
};

const statusColors = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function SupportMessagesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["support-messages"],
    queryFn: () => apiRequest("/api/admin/support-tickets"),
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/admin/support-tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
      toast({
        title: "Message updated",
        description: "The support message has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ messageId, reply }: { messageId: string; reply: string }) => {
      return apiRequest(`/api/admin/support-tickets/${messageId}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply }),
      });
    },
    onSuccess: () => {
      setShowReplyDialog(false);
      setReplyText("");
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the user.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (messageId: string, newStatus: string) => {
    updateMessageMutation.mutate({
      id: messageId,
      updates: { status: newStatus }
    });
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    sendReplyMutation.mutate({
      messageId: selectedMessage.id,
      reply: replyText.trim()
    });
  };

  const filteredMessages = messages.filter((message: SupportMessage) => {
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || message.category === categoryFilter;
    const matchesSearch = searchTerm === "" || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-3 h-3" />;
      case 'in_progress': return <MessageSquare className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'closed': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <AdminHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading support messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminHeader />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Support Messages</h1>
            <p className="text-gray-600 mt-2">Manage and respond to customer support inquiries</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="technical">Technical Problems</SelectItem>
                      <SelectItem value="proposals">Proposals & Contracts</SelectItem>
                      <SelectItem value="messaging">Messaging Issues</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCategoryFilter("all");
                    }}
                    className="w-full"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Support Messages ({filteredMessages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                  <p className="text-gray-600">No support messages match your current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Subject</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMessages.map((message: SupportMessage) => (
                        <tr key={message.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-finder-red/10 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-finder-red" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{message.name}</p>
                                <p className="text-sm text-gray-500">{message.email}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {message.message}
                            </p>
                          </td>
                          
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="capitalize">
                              {message.category.replace('_', ' ')}
                            </Badge>
                          </td>
                          
                          <td className="px-4 py-4">
                            <Select 
                              value={message.status} 
                              onValueChange={(value) => handleStatusChange(message.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(message.status)}
                                    <span className="capitalize">{message.status.replace('_', ' ')}</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Support Message Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Name</Label>
                                        <p className="text-sm">{message.name}</p>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p className="text-sm">{message.email}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Subject</Label>
                                      <p className="text-sm">{message.subject}</p>
                                    </div>
                                    <div>
                                      <Label>Message</Label>
                                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Category</Label>
                                        <p className="text-sm capitalize">{message.category.replace('_', ' ')}</p>
                                      </div>
                                      <div>
                                        <Label>Date</Label>
                                        <p className="text-sm">{new Date(message.createdAt).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMessage(message);
                                  setShowReplyDialog(true);
                                }}
                              >
                                <Reply className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Support Message</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{selectedMessage.name}</span>
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{selectedMessage.email}</span>
                </div>
                <p className="font-medium mb-2">{selectedMessage.subject}</p>
                <p className="text-sm text-gray-600">{selectedMessage.message}</p>
              </div>
              
              <div>
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sendReplyMutation.isPending}
                  className="bg-finder-red hover:bg-finder-red/90"
                >
                  {sendReplyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
