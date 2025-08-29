import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Paperclip, 
  Download, 
  FileIcon,
  MessageCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Bell,
  Reply
} from "lucide-react";
import { format } from "date-fns";
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
  quotedMessageId?: string;
  quotedMessage?: {
    sender: {
      firstName: string;
      lastName: string;
    };
    content: string;
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
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
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
    mutationFn: async ({ content, quotedMessageId }: { content: string, quotedMessageId?: string }) => {
      const response = await apiRequest(`/api/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: content.trim(), quotedMessageId }),
      });
      return response;
    },
    onSuccess: () => {
      setNewMessage("");
      setQuotedMessage(null); // Clear quoted message after sending
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messages/conversations', conversationId, 'messages'] 
      });
      toast({
        title: "Message sent!",
        description: "Your message has been delivered successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again later.",
      });
    }
  });

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content) return;
    sendMessageMutation.mutate({ content, quotedMessageId: quotedMessage?.id });
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

  // Function to handle quoting a message
  const handleQuoteMessage = (messageToQuote: Message) => {
    setQuotedMessage(messageToQuote);
  };

  // Function to cancel quoting
  const cancelQuote = () => {
    setQuotedMessage(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in Required</h3>
          <p className="text-gray-600">Please log in to view messages.</p>
        </Card>
      </div>
    );
  }

  const otherParticipant = user?.role === 'client' 
    ? conversation?.finder?.user 
    : conversation?.client;

  const participantName = otherParticipant 
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : 'Client A';

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'client' ? (
        <ClientHeader currentPage="messages" />
      ) : (
        <FinderHeader currentPage="messages" />
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Back button for mobile - hidden on desktop */}
        <div className="md:hidden w-full">
          <div className="bg-white border-b border-gray-200 p-4">
            <button 
              onClick={() => navigate("/messages")} 
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Messages
            </button>
          </div>
        </div>

        {/* Full width chat on mobile, right panel on desktop */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gray-500 text-white font-semibold">
                    {otherParticipant ? `${otherParticipant.firstName.charAt(0)}${otherParticipant.lastName.charAt(0)}` : 'CA'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold text-gray-900">{participantName}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="p-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </Button>
                <div className="relative">
                  <Button size="sm" variant="ghost" className="p-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                  </Button>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">3</span>
                  </div>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message: any, index: number) => {
                const isOwnMessage = message.senderId === user.id;
                const messageTime = format(new Date(message.createdAt), 'HH:mm');

                return (
                  <div key={message.id} className="flex items-start space-x-3">
                    {!isOwnMessage && (
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gray-500 text-white font-semibold">
                          {otherParticipant ? `${otherParticipant.firstName.charAt(0)}${otherParticipant.lastName.charAt(0)}` : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex-1 ${isOwnMessage ? 'flex justify-end' : ''}`}>
                      <div 
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl cursor-pointer group relative ${
                          isOwnMessage 
                            ? 'bg-blue-500 text-white rounded-br-md' 
                            : 'bg-white border border-gray-200 rounded-bl-md'
                        }`}
                        onClick={() => handleQuoteMessage(message)}
                      >
                        {/* Quote indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Reply className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* Quoted message display */}
                        {message.quotedMessageId && (
                          <div className={`mb-2 p-2 rounded-lg border-l-4 ${
                            isOwnMessage 
                              ? 'bg-blue-600 border-blue-300' 
                              : 'bg-gray-50 border-gray-300'
                          }`}>
                            <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                              {message.quotedMessage?.sender?.firstName} {message.quotedMessage?.sender?.lastName}
                            </p>
                            <p className={`text-sm truncate ${isOwnMessage ? 'text-blue-50' : 'text-gray-700'}`}>
                              {message.quotedMessage?.content || 'Message not found'}
                            </p>
                          </div>
                        )}

                        <p className="text-sm leading-relaxed">{message.content}</p>

                        {/* Sample emoji reactions for the last message */}
                        {index === messages.length - 1 && !isOwnMessage && (
                          <div className="flex items-center space-x-1 mt-2">
                            <span className="text-lg">😊</span>
                            <span className="text-lg">😊</span>
                            <span className="text-lg">🙌</span>
                            <span className="text-lg">🙏</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mt-1 px-1">
                        {messageTime}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            {quotedMessage && (
              <div className="flex items-center justify-between p-2 mb-2 border rounded-lg bg-gray-100">
                <div>
                  <p className="text-xs text-gray-600">Replying to {quotedMessage.sender?.firstName} {quotedMessage.sender?.lastName}</p>
                  <p className="text-sm text-gray-800 truncate max-w-md">{quotedMessage.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={cancelQuote}>
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-400 text-white">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 border-gray-200 rounded-full px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={sendMessageMutation.isPending}
                />

                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="ghost" className="p-2 rounded-full">
                    <span className="text-lg">😊</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2 rounded-full">
                    <span className="text-lg">😊</span>
                  </Button>
                </div>

                <Button 
                  onClick={handleSend}
                  disabled={sendMessageMutation.isPending || (!newMessage.trim() && !quotedMessage)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-full"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}