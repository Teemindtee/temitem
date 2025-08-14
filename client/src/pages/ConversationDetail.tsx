import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, User } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: { firstName: string; lastName: string; };
};

type ConversationDetail = {
  id: string;
  clientId: string;
  finderId: string;
  proposalId: string;
  proposal: { request: { title: string; }; };
  finder?: { user: { firstName: string; lastName: string; }; };
  client?: { firstName: string; lastName: string; };
};

export default function ConversationDetail() {
  const params = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const conversationId = params.conversationId as string;
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages/conversations', conversationId, 'messages'],
    enabled: !!conversationId && !!user,
    refetchInterval: 2000, // Refresh messages every 2 seconds
    staleTime: 1000, // Consider data stale after 1 second
    refetchOnWindowFocus: true
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', `/api/messages/conversations/${conversationId}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      // Invalidate messages to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations', conversationId, 'messages'] });
    },
    onError: (error: any) => {
      console.error('Message send error:', error);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && !sendMessageMutation.isPending) {
        sendMessageMutation.mutate(newMessage.trim());
      }
    }
  };

  const getOtherParty = () => {
    if (!messages.length) return null;
    const userId = user?.id?.toString();
    const otherMessage = messages.find(m => m.senderId !== userId);
    if (otherMessage && otherMessage.sender) {
      return `${otherMessage.sender.firstName} ${otherMessage.sender.lastName}`;
    }
    return "Other User";
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to view messages.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Loading header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
          <div className="flex items-center">
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="mr-2 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const otherParty = getOtherParty();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Mobile-optimized header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/messages">
              <Button variant="ghost" size="sm" className="mr-2 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 md:w-10 md:h-10">
                <AvatarFallback className="text-sm">
                  {otherParty?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg md:text-xl font-semibold truncate max-w-48 md:max-w-none">
                  {otherParty || "Conversation"}
                </h1>
                {messages.length > 0 && (
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages container - fills remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-3 md:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 md:py-16 text-gray-500">
              <User className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user?.id?.toString() ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-start space-x-2 md:space-x-3 max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg ${
                    message.senderId === user?.id?.toString() ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs md:text-sm">
                      {message.sender?.firstName?.charAt(0) || 'U'}
                      {message.sender?.lastName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl md:rounded-lg ${
                      message.senderId === user?.id?.toString()
                        ? 'bg-red-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.id?.toString()
                          ? 'text-red-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Mobile-optimized input area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 md:p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2 md:space-x-3">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={sendMessageMutation.isPending}
                className="w-full py-3 px-4 md:py-2 md:px-3 rounded-full md:rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-base md:text-sm resize-none"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="icon"
              className="bg-red-600 hover:bg-red-700 rounded-full p-3 md:p-2 flex-shrink-0"
            >
              <Send className="w-4 h-4 md:w-4 md:h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}