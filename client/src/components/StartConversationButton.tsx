import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

type StartConversationButtonProps = {
  proposalId: string;
  finderName: string;
};

export default function StartConversationButton({ proposalId, finderName }: StartConversationButtonProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ proposalId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      return response.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      setLocation(`/messages/${conversation.id}`);
    }
  });

  if (user?.role !== 'client') {
    return null;
  }

  return (
    <Button
      onClick={() => createConversationMutation.mutate()}
      disabled={createConversationMutation.isPending}
      className="flex items-center space-x-2"
      size="sm"
    >
      <MessageCircle className="w-4 h-4" />
      <span>
        {createConversationMutation.isPending 
          ? "Starting..." 
          : `Message ${finderName}`
        }
      </span>
    </Button>
  );
}