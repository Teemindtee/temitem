import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Paperclip, 
  Download, 
  FileIcon,
  MessageCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  FileText,
  Star,
  Phone,
  Mail,
  MoreVertical
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ClientHeader from "@/components/client-header";
import { FinderHeader } from "@/components/finder-header";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentPaths?: string[];
  attachmentNames?: string[];
  isRead: boolean;
  createdAt: Date;
  sender: { 
    firstName: string; 
    lastName: string; 
  };
};

type ConversationDetail = {
  id: string;
  clientId: string;
  finderId: string;
  proposalId: string;
  proposal: { 
    request: { 
      title: string; 
    }; 
  };
  finder?: { 
    user: { 
      firstName: string; 
      lastName: string; 
    }; 
  };
  client?: { 
    firstName: string; 
    lastName: string; 
  };
};

export default function ConversationDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const conversationId = params.conversationId as string;
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<{path: string; name: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation } = useQuery<ConversationDetail>({
    queryKey: ['/api/messages/conversations', conversationId],
    enabled: !!conversationId && !!user,
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages/conversations', conversationId, 'messages'],
    enabled: !!conversationId && !!user,
    refetchInterval: 3000,
    staleTime: 1000,
    refetchOnWindowFocus: true
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachmentPaths, attachmentNames }: {
      content: string;
      attachmentPaths?: string[];
      attachmentNames?: string[];
    }) => {
      console.log('Sending message:', { content, attachmentPaths, attachmentNames });
      
      const response = await apiRequest(`/api/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          attachmentPaths: attachmentPaths || [],
          attachmentNames: attachmentNames || []
        }),
      });
      
      console.log('Message sent successfully:', response);
      return response;
    },
    onSuccess: () => {
      setNewMessage("");
      setPendingAttachments([]);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messages/conversations', conversationId, 'messages'] 
      });
      toast({
        title: "Message sent!",
        description: "Your message has been delivered successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Message send error:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again later.",
      });
    }
  });

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content && pendingAttachments.length === 0) {
      return;
    }

    sendMessageMutation.mutate({
      content,
      attachmentPaths: pendingAttachments.map(a => a.path),
      attachmentNames: pendingAttachments.map(a => a.name)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* App Header for unauthenticated users */}
        <div className="bg-finder-red text-white px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold">FinderMeister</span>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('common.access_denied')}</h1>
          <p className="text-slate-600 mb-6">{t('messages.signin_required')}</p>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            {t('auth.signin')}
          </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* App Header */}
        {user?.role === 'client' ? (
          <ClientHeader currentPage="messages" />
        ) : (
          <FinderHeader currentPage="messages" />
        )}
        
        {/* Loading Content */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <button 
                onClick={() => navigate("/messages")} 
                className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="font-medium text-sm sm:text-base">{t('navigation.messages')}</span>
              </button>
              <div className="flex items-center space-x-2">
                <LanguageSwitcher className="text-xs" />
                <div className="text-xs sm:text-sm text-slate-500">{t('common.loading')}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="h-16 bg-slate-200 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
        </div>
      </div>
    );
  }

  // Get conversation details
  const otherParticipant = user?.role === 'client' 
    ? conversation?.finder?.user 
    : conversation?.client;

  const participantName = otherParticipant 
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : "Unknown User";

  const participantInitials = participantName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      {user?.role === 'client' ? (
        <ClientHeader currentPage="messages" />
      ) : (
        <FinderHeader currentPage="messages" />
      )}
      
      {/* Conversation Header */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={() => navigate("/messages")} 
              className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="font-medium text-sm sm:text-base">{t('navigation.messages')}</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSwitcher className="mr-2" />
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm">
                    {participantInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-slate-900">{participantName}</div>
                  <div className="text-xs text-slate-500">
                    {user?.role === 'client' ? t('roles.finder') : t('roles.client')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Project Context */}
        {conversation?.proposal?.request && (
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Project: {conversation.proposal.request.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Discussing project details with {participantName}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Active Project
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages Container */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-96 sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Start the conversation</h3>
                  <p className="text-slate-600 mb-6 max-w-md">
                    Send your first message to {participantName} to discuss the project details.
                  </p>
                </div>
              ) : (
                /* Messages List */
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user.id;
                  const messageTime = new Date(message.createdAt);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${
                        isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        {!isOwnMessage && (
                          <Avatar className="w-8 h-8 border-2 border-blue-200 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
                              {participantInitials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isOwnMessage 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-slate-200'
                        }`}>
                          {message.content && (
                            <p className={`text-sm leading-relaxed ${
                              isOwnMessage ? 'text-white' : 'text-slate-700'
                            }`}>
                              {message.content}
                            </p>
                          )}
                          
                          {message.attachmentPaths && message.attachmentPaths.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachmentPaths.map((path, index) => {
                                const fileName = message.attachmentNames?.[index] || `attachment-${index + 1}`;
                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                                
                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center space-x-2 p-2 rounded-lg ${
                                      isOwnMessage ? 'bg-blue-500' : 'bg-slate-50'
                                    }`}
                                  >
                                    {isImage ? (
                                      <ImageIcon className="w-4 h-4" />
                                    ) : (
                                      <FileIcon className="w-4 h-4" />
                                    )}
                                    <span className="text-xs font-medium truncate flex-1">
                                      {fileName}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`p-1 h-6 w-6 ${
                                        isOwnMessage 
                                          ? 'hover:bg-blue-500 text-white' 
                                          : 'hover:bg-slate-100'
                                      }`}
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className={`flex items-center justify-between mt-2 ${
                            isOwnMessage ? 'text-blue-100' : 'text-slate-400'
                          }`}>
                            <span className="text-xs">
                              {format(messageTime, 'MMM d, h:mm a')}
                            </span>
                            {isOwnMessage && (
                              <CheckCircle2 className="w-3 h-3 ml-2" />
                            )}
                          </div>
                        </div>
                        
                        {isOwnMessage && (
                          <Avatar className="w-8 h-8 border-2 border-green-200 flex-shrink-0">
                            <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-xs">
                              {(user.firstName || "").charAt(0)}{(user.lastName || "").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <Separator />

            {/* Message Input */}
            <div className="p-4 sm:p-6">
              {/* Pending Attachments */}
              {pendingAttachments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {pendingAttachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center space-x-2">
                        <FileIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {attachment.name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== index))}
                        className="text-slate-500 hover:text-red-600 p-1 h-6 w-6"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="flex items-end space-x-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${participantName}...`}
                    className="min-h-12 resize-none bg-slate-50 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-3 border-slate-200 hover:bg-slate-50"
                    disabled={sendMessageMutation.isPending}
                  >
                    <Paperclip className="w-4 h-4 text-slate-600" />
                  </Button>
                  
                  <Button
                    onClick={handleSend}
                    disabled={sendMessageMutation.isPending || (!newMessage.trim() && pendingAttachments.length === 0)}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-slate-500 mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Contract Status</h4>
              <p className="text-xs text-slate-600">View project progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Rate & Review</h4>
              <p className="text-xs text-slate-600">Share your experience</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-1">Project Files</h4>
              <p className="text-xs text-slate-600">Download attachments</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </div>
  );
}