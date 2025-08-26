import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageCircle, Clock, User, Search, Filter, MoreVertical, CheckCircle2, Circle, Star } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import ClientHeader from "@/components/client-header";

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

export default function Messages() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, unread, archived
  
  const { data: conversations = [], isLoading } = useQuery<ConversationListItem[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user
  });

  // Filter conversations based on search and filters
  const filteredConversations = conversations.filter(conversation => {
    const otherUser = user?.role === 'client' 
      ? conversation.finder?.user 
      : conversation.client;
    const userName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : '';
    const projectTitle = conversation.proposal?.request?.title || '';
    
    const matchesSearch = searchTerm === '' || 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'unread' && conversation.unreadCount > 0);
    
    return matchesSearch && matchesFilter;
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
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header Skeleton */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
            </div>
            
            {/* Conversation List Skeleton */}
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="messages" />
      
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-gray-200 bg-white">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-finder-red/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-finder-red" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                      {conversations.filter(c => c.unreadCount > 0).length > 0 && 
                        ` • ${conversations.filter(c => c.unreadCount > 0).length} unread`}
                    </p>
                  </div>
                </div>
                
                {/* Filter Pills */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant={selectedFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('all')}
                    className={selectedFilter === 'all' ? 'bg-finder-red hover:bg-finder-red/90' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedFilter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('unread')}
                    className={selectedFilter === 'unread' ? 'bg-finder-red hover:bg-finder-red/90' : ''}
                  >
                    Unread
                    {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {conversations.filter(c => c.unreadCount > 0).length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border-gray-300 rounded-lg focus:border-finder-red focus:ring-finder-red"
                />
              </div>
            </div>
          </div>

          {/* Mobile Filter Pills */}
          <div className="md:hidden border-b border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className={selectedFilter === 'all' ? 'bg-finder-red hover:bg-finder-red/90' : ''}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('unread')}
                className={selectedFilter === 'unread' ? 'bg-finder-red hover:bg-finder-red/90' : ''}
              >
                Unread
                {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {conversations.filter(c => c.unreadCount > 0).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                {searchTerm || selectedFilter !== 'all' ? (
                  // No results state
                  <div>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  // Empty state
                  <div>
                    <div className="w-16 h-16 bg-finder-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-finder-red" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {user?.role === 'client' 
                        ? "Your conversations with finders will appear here when they respond to your project requests."
                        : "Your conversations with clients will appear here when they message you about your proposals."
                      }
                    </p>
                    {user?.role === 'client' && (
                      <Button asChild className="bg-finder-red hover:bg-finder-red/90">
                        <Link href="/client/create-find">Post Your First Find</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
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
                  ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })
                  : formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true });
                const isUnread = conversation.unreadCount > 0;
                const isFromOtherUser = conversation.lastMessage?.senderId !== user?.id;

                return (
                  <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                    <div 
                      className={`
                        p-4 md:p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer
                        ${isUnread ? 'bg-blue-50/30 border-l-4 border-l-finder-red' : ''}
                      `}
                    >
                      <div className="flex items-start space-x-3 md:space-x-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-11 h-11 md:w-12 md:h-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {isUnread && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-finder-red rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold truncate text-sm md:text-base ${
                                isUnread ? 'text-gray-900' : 'text-gray-800'
                              }`}>
                                {displayName}
                              </h3>
                              <p className="text-xs md:text-sm text-finder-red truncate mt-0.5">
                                {conversation.proposal?.request?.title || 'No title available'}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                              {isUnread && (
                                <Badge variant="secondary" className="bg-finder-red text-white text-xs px-2 py-0.5">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {lastMessageTime}
                              </span>
                            </div>
                          </div>
                          
                          {conversation.lastMessage && (
                            <div className="flex items-center space-x-1 mt-2">
                              {!isFromOtherUser && (
                                <CheckCircle2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                              <p className={`text-sm truncate ${
                                isUnread && isFromOtherUser ? 'font-medium text-gray-900' : 'text-gray-600'
                              }`}>
                                {!isFromOtherUser && <span className="text-gray-500">You: </span>}
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}