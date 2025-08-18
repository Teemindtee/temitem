import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type StartConversationButtonProps = {
  proposalId: string;
  finderName?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  children?: ReactNode;
};

export default function StartConversationButton({ 
  proposalId, 
  finderName = "Finder", 
  className = "",
  variant = "default",
  children 
}: StartConversationButtonProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ proposalId }),
      });
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      setLocation(`/messages/${conversation.id}`);
      toast({
        title: "Success!",
        description: "Conversation started successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Conversation creation error:', error);
      const errorMessage = error?.message || "Failed to start conversation. Please try again.";
      console.log('Error message to show user:', errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  });

  if (user?.role !== 'client') {
    return null;
  }

  return (
    <Button
      onClick={() => createConversationMutation.mutate()}
      disabled={createConversationMutation.isPending}
      className={className}
      variant={variant}
      size="sm"
    >
      {children || (
        <>
          <MessageCircle className="w-4 h-4 mr-2" />
          <span>
            {createConversationMutation.isPending 
              ? "Starting..." 
              : `Message ${finderName}`
            }
          </span>
        </>
      )}
    </Button>
  );
}