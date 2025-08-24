import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  X,
  ChevronRight,
  Search
} from "lucide-react";

interface SupportWidgetProps {
  context?: 'dashboard' | 'contracts' | 'proposals' | 'messages' | 'profile' | 'tokens';
}

const contextualHelp = {
  dashboard: {
    title: "Dashboard Help",
    tips: [
      "Your dashboard shows active contracts and recent activity",
      "Use the sidebar to navigate between different sections",
      "Check notifications for important updates"
    ],
    faqs: [
      { q: "How do I view my active contracts?", a: "Active contracts are displayed in the main dashboard area" },
      { q: "What does the completed jobs counter show?", a: "This shows the total number of contracts you've successfully completed" }
    ]
  },
  contracts: {
    title: "Contracts Help",
    tips: [
      "Click on any contract to view detailed information",
      "Submit your work when ready for client review",
      "Track escrow status to see payment progress"
    ],
    faqs: [
      { q: "How do I submit completed work?", a: "Click the 'Submit Work' button on your contract and upload your deliverables" },
      { q: "When will I get paid?", a: "Payment is released from escrow once the client approves your work" }
    ]
  },
  proposals: {
    title: "Proposals Help",
    tips: [
      "Each proposal costs 1 token to submit",
      "Write detailed proposals to increase your chances",
      "Include relevant portfolio items"
    ],
    faqs: [
      { q: "How many proposals can I submit?", a: "You can submit as many proposals as you have tokens for" },
      { q: "Can I edit a proposal after submitting?", a: "No, proposals cannot be edited once submitted" }
    ]
  },
  messages: {
    title: "Messaging Help",
    tips: [
      "Only clients can initiate conversations",
      "All messages are linked to specific proposals",
      "Be professional in all communications"
    ],
    faqs: [
      { q: "Why can't I message this user?", a: "Finders can only respond to messages from clients who have their proposals" },
      { q: "Are messages private?", a: "Yes, only you and the other party can see your conversation" }
    ]
  },
  tokens: {
    title: "Tokens Help",
    tips: [
      "Tokens are required to submit proposals",
      "Purchase tokens in bundles for better value",
      "Your token balance is shown in your dashboard"
    ],
    faqs: [
      { q: "How much do tokens cost?", a: "Token packages start at ₦10 for 10 tokens" },
      { q: "Do tokens expire?", a: "No, tokens never expire and remain in your account" }
    ]
  },
  profile: {
    title: "Profile Help",
    tips: [
      "Complete your profile to attract more clients",
      "Add portfolio items to showcase your work",
      "Set competitive but fair rates"
    ],
    faqs: [
      { q: "How important is my profile?", a: "A complete profile significantly increases your chances of winning contracts" },
      { q: "Can I change my specialization?", a: "Yes, you can update your skills and specialization anytime" }
    ]
  }
};

export function SupportWidget({ context }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const currentHelp = context ? contextualHelp[context] : null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-finder-red hover:bg-finder-red-dark text-white rounded-full p-4 shadow-lg"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {currentHelp ? currentHelp.title : "Help & Support"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="space-y-2">
            <Link href="/support/help-center">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Browse Help Center
              </Button>
            </Link>
            <Link href="/support/contact">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </div>

          {/* Contextual Help */}
          {currentHelp && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Quick Tips</h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  {currentHelp.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Common Questions</h4>
                <div className="space-y-2">
                  {currentHelp.faqs.map((faq, index) => (
                    <details key={index} className="text-xs">
                      <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                        {faq.q}
                      </summary>
                      <p className="mt-1 text-gray-600 pl-4">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Live Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Support Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Online</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}