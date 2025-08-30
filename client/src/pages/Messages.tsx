import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageCircle, Clock, User, Search, Filter, MoreVertical, CheckCircle2, Circle, Star, ExternalLink, Bell, Reply, X, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import ClientHeader from "@/components/client-header";
import { apiRequest } from "@/lib/auth";

type ConversationListItem = {
  id: string;
  clientId: string;
  finderId: string;
  proposalId: string;
  lastMessageAt: Date;
  createdAt: Date;
  proposal: { request: { title: string; }; };
  finder?: { user: { firstName: string; lastName: string; }; };
  client?: { firstName: string; lastName: string; };
  lastMessage?: { content: string; createdAt: Date; senderId: string; };
  unreadCount: number;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender?: { firstName: string; lastName: string; };
};

export default function Messages() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery<ConversationListItem[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user
  });

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const otherUser = user?.role === 'client'
      ? conversation.finder?.user
      : conversation.client;
    const userName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : '';
    const projectTitle = conversation.proposal?.request?.title || '';

    const matchesSearch = searchTerm === '' ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectTitle.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in Required</h3>
          <p className="text-gray-600">Please log in to view your messages.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader currentPage="messages" />
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel Skeleton */}
          <div className="w-1/3 bg-white border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-4"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right Panel Skeleton */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="messages" />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Conversation List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Message & System</h1>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="p-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </Button>
                <div className="relative">
                  <Button size="sm" variant="ghost" className="p-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                  </Button>
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {conversations.filter(c => c.unreadCount > 0).length}
                      </span>
                    </div>
                  )}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Conversations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
                <p className="text-gray-600">Start a conversation to see it here.</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => {
                  const otherUser = user?.role === 'client'
                    ? conversation.finder?.user
                    : conversation.client;
                  const displayName = otherUser
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : 'Unknown User';
                  const initials = otherUser
                    ? `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}`.toUpperCase()
                    : 'U';
                  const lastMessageTime = conversation.lastMessage?.createdAt
                    ? format(new Date(conversation.lastMessage.createdAt), 'HH:mm')
                    : format(new Date(conversation.lastMessageAt), 'HH:mm');
                  const isUnread = conversation.unreadCount > 0;
                  const isSelected = selectedConversation === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`
                        p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150
                        ${isSelected ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar with online indicator */}
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gray-500 text-white font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Dynamic online indicator */}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium text-sm truncate ${
                              isUnread ? 'text-gray-900' : 'text-gray-800'
                            }`}>
                              {displayName}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {lastMessageTime}
                            </span>
                          </div>

                          <p className={`text-sm truncate ${
                            isUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>

                        {isUnread && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {selectedConversation ? (
            <ConversationView conversationId={selectedConversation} />
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the left to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Conversation View Component
function ConversationView({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['/api/messages/conversations', conversationId],
    enabled: !!conversationId && !!user,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages/conversations', conversationId, 'messages'],
    enabled: !!conversationId && !!user,
    refetchInterval: 3000,
  });

  const otherUser = user?.role === 'client'
    ? conversation?.finder?.user
    : conversation?.client;
  const participantName = otherUser
    ? `${otherUser.firstName} ${otherUser.lastName}`
    : 'Client A';

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
      setQuotedMessage(null);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/messages/conversations', conversationId, 'messages'] 
      });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    }
  });

  const handleSendMessage = () => {
    const content = newMessage.trim();
    if (!content) return;
    sendMessageMutation.mutate({ content, quotedMessageId: quotedMessage?.id });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuoteMessage = (message: Message) => {
    setQuotedMessage(message);
  };


  return (
    <>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-500 text-white font-semibold">
                  {otherUser ? `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}` : 'CA'}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{participantName}</h2>
              <p className={`text-xs ${Math.random() > 0.5 ? 'text-green-600' : 'text-gray-500'}`}>
                {Math.random() > 0.5 ? 'Online' : 'Last seen recently'}
              </p>
            </div>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Start the conversation...</p>
            </div>
          </div>
        ) : (
          messages.map((message: Message, index: number) => {
            const isOwnMessage = message.senderId === user.id;
            const messageTime = format(new Date(message.createdAt), 'HH:mm');

            return (
              <div key={message.id} className="flex items-start space-x-3">
                {!isOwnMessage && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gray-500 text-white font-semibold">
                      {otherUser ? `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex-1 ${isOwnMessage ? 'flex justify-end' : ''}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 rounded-bl-md'
                  }`}
                    onDoubleClick={() => handleQuoteMessage(message)} // Quote on double click
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {/* Emoji reactions */}
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
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200">
        {/* Quoted Message Preview */}
        {quotedMessage && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Reply className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Replying to {quotedMessage.sender?.firstName} {quotedMessage.sender?.lastName}
                  </span>
                </div>
                <p className="text-sm text-gray-600 bg-white p-2 rounded border-l-4 border-blue-500">
                  {quotedMessage.content}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setQuotedMessage(null)}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="p-4">
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
                placeholder={quotedMessage ? "Type a reply..." : "Type a message..."}
                className="flex-1 border-gray-200 rounded-full px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !newMessage.trim()}
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
    </>
  );
}