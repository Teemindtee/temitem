import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";

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
  
  const { data: conversations = [], isLoading } = useQuery<ConversationListItem[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to view your messages.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          </div>
          {conversations.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {user.role === 'client' 
                  ? "Start a conversation by messaging a finder who submitted a proposal to your request."
                  : "Conversations will appear here when clients message you about your proposals."
                }
              </p>
              {user.role === 'client' && (
                <Link href="/browse-requests">
                  <Button>Browse Requests</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 p-1 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full" />
                        <div>
                          <h3 className="font-semibold">
                            {user.role === 'client' 
                              ? `${conversation.finder?.user.firstName} ${conversation.finder?.user.lastName}`
                              : `${conversation.client?.firstName} ${conversation.client?.lastName}`
                            }
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Re: {conversation.proposal.request.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(new Date(conversation.lastMessageAt), 'MMM d')}
                        </div>
                      </div>
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.senderId === user?.id.toString() ? "You: " : ""}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}