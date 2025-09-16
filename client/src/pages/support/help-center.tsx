import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  FileText, 
  CreditCard, 
  Shield, 
  MessageSquare,
  ChevronRight,
  HelpCircle,
  Phone,
  Mail,
  Clock
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "Who can join FinderMeister?",
    answer: "Two roles, one community (you can be both): Clients — Anyone who needs something sourced or a task executed: individuals, students, small businesses/brands, event planners, NGOs, and Nigerians in the diaspora. Clients pay safely via escrow and can optionally boost requests with FinderTokens (required for high-budget finds > ₦50,000). Finders — Resourceful people who can locate items/services or carry out tasks reliably: students, side-hustlers, personal shoppers, couriers, fixers, and professionals.",
    category: "Getting Started",
    tags: ["registration", "client", "finder", "community"]
  },
  {
    id: "2",
    question: "Do I need technical expertise or special skills?",
    answer: "No. You don't need coding or advanced skills. If you're good at locating items (gadgets, accommodation, groceries, pharmaceuticals, thrift) or handling tasks (errands, delivery, event setup), you qualify.",
    category: "Getting Started",
    tags: ["skills", "requirements", "finder"]
  },
  {
    id: "3",
    question: "What exactly is a Find?",
    answer: "A Find can be either: Sourcing — Helping a client locate a product, service, or opportunity (e.g., apartment, sneakers, textbooks, medications, tickets). Task Execution — Carrying out an activity on behalf of a client (e.g., groceries, couriering, event setup).",
    category: "Getting Started",
    tags: ["find", "sourcing", "task", "service"]
  },
  {
    id: "4",
    question: "How do I create a service request?",
    answer: "To create a service request: 1) Log in to your client account, 2) Click 'Create Request' on your dashboard, 3) Fill in the details including title, description, budget, and timeline, 4) Click 'Post Request' to make it live for finders to see.",
    category: "Getting Started",
    tags: ["request", "posting", "client"]
  },
  {
    id: "5",
    question: "How do I become a finder?",
    answer: "To become a finder: 1) Click 'Register as Finder' on the homepage, 2) Complete your profile with skills, experience, and portfolio, 3) Purchase proposal tokens to submit proposals, 4) Browse available finds and submit proposals to win contracts.",
    category: "Getting Started",
    tags: ["finder", "registration", "profile"]
  },
  {
    id: "6",
    question: "How much does it cost to register?",
    answer: "Registration is free. FinderMeister only charges 15% per contract once you earn.",
    category: "Getting Started",
    tags: ["registration", "cost", "free"]
  },
  {
    id: "7",
    question: "Can I join from outside Nigeria?",
    answer: "At launch, FinderMeister is Nigeria-first. Clients abroad can still pay through Flutterwave, while Nigerian Finders complete local finds.",
    category: "Getting Started",
    tags: ["international", "nigeria", "location"]
  },
  {
    id: "8",
    question: "How do payments work?",
    answer: "Client pays the contract fee upfront through Flutterwave escrow. Flutterwave adds a small processing fee (1.4% local, capped at ₦2,000; 3.8% for international) — on the client's side. FinderMeister holds funds until completion. FinderMeister deducts 15% per contract. Finder receives the remaining 85% directly to their account. Example: Client pays ₦20,000 (+ processing fee). FinderMeister charges ₦3,000 (15%). Finder gets ₦17,000.",
    category: "Tokens & Payments",
    tags: ["payment", "escrow", "fees", "flutterwave"]
  },
  {
    id: "9",
    question: "Is my money safe?",
    answer: "Yes. All payments are held in escrow until the client confirms delivery.",
    category: "Tokens & Payments",
    tags: ["escrow", "safety", "security"]
  },
  {
    id: "10",
    question: "What if there's a dispute?",
    answer: "FinderMeister has a dispute resolution system. If a complaint is raised, we investigate and only release funds once it's resolved fairly.",
    category: "Tokens & Payments",
    tags: ["dispute", "resolution", "support"]
  },
  {
    id: "11",
    question: "When do I get paid?",
    answer: "Once the client approves completion, payments are split automatically. Funds are sent to your bank account (Flutterwave may apply a small payout fee, e.g., ₦45).",
    category: "Tokens & Payments",
    tags: ["payment", "withdrawal", "timing"]
  },
  {
    id: "12",
    question: "How do I withdraw my earnings?",
    answer: "To withdraw earnings: 1) Go to your finder profile settings, 2) Click 'Withdrawals', 3) Enter the amount you want to withdraw, 4) Provide your payment details, 5) Submit the withdrawal request for processing.",
    category: "Tokens & Payments",
    tags: ["withdrawal", "earnings", "payment"]
  },
  {
    id: "13",
    question: "What are FinderTokens?",
    answer: "FinderTokens are platform credits used to apply for finds and boost visibility.",
    category: "Tokens & Payments",
    tags: ["tokens", "credits", "findertokens"]
  },
  {
    id: "14",
    question: "How do FinderTokens work for Finders?",
    answer: "Each application costs 10 FinderTokens. Every Finder receives 20 FinderTokens free monthly. Additional tokens can be purchased to apply for more finds.",
    category: "Tokens & Payments",
    tags: ["tokens", "finder", "proposals", "monthly"]
  },
  {
    id: "15",
    question: "How do FinderTokens work for Clients?",
    answer: "Optional for boosting a find (makes it more visible). Required for high-budget finds above ₦50,000.",
    category: "Tokens & Payments",
    tags: ["tokens", "client", "boost", "visibility"]
  },
  {
    id: "16",
    question: "Do FinderTokens replace money?",
    answer: "No. FinderTokens are not cash. They are credits for applying/boosting. Payments are always made in Naira (₦) via escrow.",
    category: "Tokens & Payments",
    tags: ["tokens", "currency", "naira", "escrow"]
  },
  {
    id: "17",
    question: "Why use FinderTokens?",
    answer: "To reduce spam (Finders apply more carefully). To show seriousness (Clients boost or stake tokens). To keep the marketplace balanced and active.",
    category: "Tokens & Payments",
    tags: ["tokens", "spam", "quality", "marketplace"]
  },
  {
    id: "18",
    question: "How does the escrow system work?",
    answer: "When a contract is created, the client's payment is held in escrow. The finder completes the work and submits it for review. Once the client approves the work, the payment is released to the finder. This protects both parties in the transaction.",
    category: "Tokens & Payments",
    tags: ["escrow", "payment", "security"]
  },
  {
    id: "19",
    question: "How do I message other users?",
    answer: "Clients can initiate conversations with finders who have submitted proposals for their finds. Go to your find details, view proposals, and click 'Message' next to any finder. All conversations are linked to specific proposals for context.",
    category: "Communication",
    tags: ["messaging", "communication", "proposals"]
  },
  {
    id: "20",
    question: "What happens after I submit my work?",
    answer: "After submitting work: 1) Your submission goes to 'Under Review' status, 2) The client reviews your work and may request revisions, 3) Once approved, the contract is marked complete and payment is released from escrow to your account.",
    category: "Work Completion",
    tags: ["submission", "review", "completion"]
  },
  {
    id: "21",
    question: "Can I edit my profile after registration?",
    answer: "Yes! You can always edit your profile. For finders, go to 'Profile' in your dashboard to update skills, bio, portfolio, and rates. For clients, you can update your basic information in account settings.",
    category: "Account Management",
    tags: ["profile", "editing", "account"]
  },
  {
    id: "22",
    question: "What types of finds are popular?",
    answer: "Groceries & Errands: shopping, delivery runs. Pharmaceuticals: medications and health supplies. Fashion & Thrift: clothes, sneakers, accessories. Tech & Gadgets: phones, laptops, electronics. Real Estate: hostels, apartments, short lets. Events & Entertainment: tickets, logistics. Everyday Tasks: courier services, school errands, small repairs.",
    category: "Getting Started",
    tags: ["finds", "categories", "popular", "types"]
  },
  {
    id: "23",
    question: "What is gamification on FinderMeister?",
    answer: "Gamification makes FinderMeister more fun and rewarding by adding game-like features for Finders. Instead of only earning money, you also rise through ranks, earn recognition, and build credibility.",
    category: "Gamification",
    tags: ["gamification", "ranks", "finder", "rewards"]
  },
  {
    id: "24",
    question: "How does gamification work for Finders?",
    answer: "Finders rise through 5 ranks as they complete more finds, maintain good ratings, and stay consistent: Novice — New member, just starting out. Pathfinder — Completed first successful finds. Seeker — Gaining trust with multiple completed finds. Meister — Highly trusted, proven Finder with excellent client reviews. Grandmeister — The elite top-tier Finder: consistent, reliable, and top rated.",
    category: "Gamification",
    tags: ["ranks", "levels", "progression", "finder"]
  },
  {
    id: "25",
    question: "Why gamify FinderMeister?",
    answer: "Makes the Finder journey exciting and rewarding. Motivates Finders to stay consistent and professional. Builds trust by showing clients the rank and credibility of each Finder. Creates a sense of achievement beyond just money.",
    category: "Gamification",
    tags: ["motivation", "trust", "achievement", "professional"]
  }
];

const categories = [
  { name: "Getting Started", icon: User, color: "bg-blue-100 text-blue-800" },
  { name: "Tokens & Payments", icon: CreditCard, color: "bg-green-100 text-green-800" },
  { name: "Communication", icon: MessageSquare, color: "bg-purple-100 text-purple-800" },
  { name: "Work Completion", icon: FileText, color: "bg-orange-100 text-orange-800" },
  { name: "Account Management", icon: Shield, color: "bg-gray-100 text-gray-800" },
  { name: "Gamification", icon: HelpCircle, color: "bg-indigo-100 text-indigo-800" }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions and get support for using FinderMeister
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles, FAQs, or guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Need More Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-gray-600">support@findermeister.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Overview */}
            {!selectedCategory && !searchTerm && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const categoryFAQs = faqs.filter(faq => faq.category === category.name);
                    return (
                      <Card 
                        key={category.name}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${category.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                <p className="text-sm text-gray-600">{categoryFAQs.length} articles</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FAQ Results */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory ? `${selectedCategory} FAQs` : 'Frequently Asked Questions'}
                </h2>
                {selectedCategory && (
                  <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                    Show All Categories
                  </Button>
                )}
              </div>

              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search terms or browse by category.
                    </p>
                    <Button onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}>
                      Reset Search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => {
                    const category = categories.find(c => c.name === faq.category);
                    return (
                      <Card key={faq.id}>
                        <CardHeader 
                          className="cursor-pointer"
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-gray-900 mb-2">
                                {faq.question}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                {category && (
                                  <Badge className={category.color}>
                                    {faq.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight 
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedFAQ === faq.id ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </CardHeader>
                        {expandedFAQ === faq.id && (
                          <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}