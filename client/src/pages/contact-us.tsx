
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  MapPin,
  ArrowLeft,
  Send,
  Facebook,
  Twitter,
  Instagram
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

export default function ContactUs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.firstName + " " + user?.lastName || "",
    email: user?.email || "",
    phone: "",
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
      if (!response.ok) throw new Error("Failed to send message");
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
        phone: "",
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
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-finder-red rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Contact Us</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-finder-red to-finder-red/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We're here to help you with any questions or concerns about FinderMeister
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <MessageSquare className="w-6 h-6 mr-3 text-finder-red" />
                  Send us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
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
                        placeholder="Enter your email"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        className="mt-1"
                      />
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
                      placeholder="Please provide detailed information about your inquiry..."
                      rows={6}
                      required
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-finder-red hover:bg-finder-red/90 text-white py-3 text-lg"
                    disabled={submitMessage.isPending}
                  >
                    {submitMessage.isPending ? (
                      "Sending..."
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

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
                <p className="text-gray-600 text-sm">
                  Reach out to us through any of these channels
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-finder-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-finder-red" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600 text-sm">findermeisterinnovations@gmail.com</p>
                    <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm">+233-7039391065</p>
                    <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9 AM - 6 PM WAT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office Address</h3>
                    <p className="text-gray-600 text-sm">18 Back of Road safety office, Moniya, Ibadan</p>
                    <p className="text-xs text-gray-500 mt-1">Nigeria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Follow Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href="https://twitter.com/findermeister" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group">
                  <Twitter className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600">X (Twitter)</p>
                    <p className="text-sm text-gray-600">@findermeister</p>
                  </div>
                </a>

                <a href="https://facebook.com/findermeister" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600">Facebook</p>
                    <p className="text-sm text-gray-600">@findermeister</p>
                  </div>
                </a>

                <a href="https://instagram.com/findermeister" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors group">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-pink-600">Instagram</p>
                    <p className="text-sm text-gray-600">@findermeister</p>
                  </div>
                </a>

                <a href="https://tiktok.com/@findermeisterinnovations" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-gray-700">TikTok</p>
                    <p className="text-sm text-gray-600">@findermeisterinnovations</p>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="w-5 h-5 mr-2" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm"><strong>Email:</strong> Within 24 hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm"><strong>Phone:</strong> Immediate during business hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm"><strong>Social Media:</strong> 2-4 hours</span>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">All systems operational</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
