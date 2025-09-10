import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Shield, 
  Users,
  ArrowRight,
  Search,
  BookOpen,
  Headphones,
  Clock,
  Send,
  Mail
} from "lucide-react";

const contactCategories = [
  { value: "general", label: "General Inquiry" },
  { value: "account", label: "Account Issues" },
  { value: "billing", label: "Billing & Payments" },
  { value: "technical", label: "Technical Problems" },
  { value: "proposals", label: "Proposals & Contracts" },
  { value: "messaging", label: "Messaging Issues" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other" }
];

export default function SupportIndex() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.firstName + " " + user?.lastName || "",
    email: user?.email || "",
    category: "",
    subject: "",
    message: ""
  });

  const submitMessage = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to submit message");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: user?.firstName + " " + user?.lastName || "",
        email: user?.email || "",
        category: "",
        subject: "",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage.mutate(formData);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-finder-red rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Support Center</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-300">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get instant answers, contact our support team, or explore our comprehensive help resources
          </p>
        </div>

        {/* Quick Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Help Center */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Help Center
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Find answers to common questions about using FinderMeister, managing proposals, payments, and more.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Search className="w-4 h-4 mr-1" />
                      <span>Searchable</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>50+ Articles</span>
                    </div>
                  </div>
                  <Link href="/support/help-center">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Browse Help Center
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-finder-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-6 h-6 text-finder-red" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-finder-red transition-colors">
                    Contact Support
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Submit a support ticket for account issues, technical problems, or billing questions with priority support.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>24h Response</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Secure</span>
                    </div>
                  </div>
                  <Link href="/support/contact">
                    <Button className="bg-finder-red hover:bg-finder-red/90 text-white">
                      Contact Support
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Topics */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Popular Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/support/help-center">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-finder-red/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-finder-red" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-finder-red transition-colors">Getting Started</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/support/help-center">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">Proposals & Contracts</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/support/help-center">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-green-600 transition-colors">Messaging</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/support/help-center">
              <Card className="border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-purple-600 transition-colors">Payments & Security</h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="text-center">
          <Card className="bg-green-50 border border-green-200 inline-block">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">All systems operational</span>
            </CardContent>
          </Card>
        </div>

        {/* Contact Us Form */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Mail className="w-6 h-6 mr-3 text-finder-red" />
                Send us a Message
              </CardTitle>
              <p className="text-gray-600">
                Fill out the form below and we'll respond within 24 hours.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => updateFormData("subject", e.target.value)}
                    placeholder="Brief description of your inquiry"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateFormData("message", e.target.value)}
                    placeholder="Provide detailed information about your inquiry..."
                    rows={6}
                    required
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-finder-red hover:bg-finder-red/90 text-white py-3 text-lg font-medium"
                  disabled={submitMessage.isPending}
                >
                  {submitMessage.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}