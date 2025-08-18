import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
  Clock
} from "lucide-react";

export default function SupportIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -z-10" style={{ backgroundColor: "hsl(1, 81%, 63%)" }} />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 -z-10" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -z-10" style={{ backgroundColor: "hsl(1, 81%, 73%)" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">FinderMeister Support</h1>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent mb-6" style={{ backgroundImage: "linear-gradient(to right, hsl(213, 27%, 16%), hsl(1, 81%, 53%))" }}>
              How can we help you?
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Get instant answers, contact our support team, or explore our comprehensive help resources
            </p>
          </div>

          {/* Quick Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Help Center */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(147, 78%, 42%), hsl(159, 100%, 36%))" }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Help Center
                    </CardTitle>
                    <p className="text-slate-600 text-sm">Browse FAQs and guides</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Find answers to common questions about using FinderMeister, managing proposals, payments, and more.
                </p>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
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
                    <Button className="text-white shadow-lg hover:shadow-xl transition-all" style={{ background: "linear-gradient(to right, hsl(147, 78%, 42%), hsl(159, 100%, 36%))" }}>
                      Browse Help
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-finder-red transition-colors">
                      Contact Support
                    </CardTitle>
                    <p className="text-slate-600 text-sm">Get personalized help</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Submit a support ticket for account issues, technical problems, or billing questions with priority support.
                </p>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
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
                    <Button className="text-white shadow-lg hover:shadow-xl transition-all" style={{ background: "linear-gradient(to right, hsl(1, 81%, 53%), hsl(1, 71%, 43%))" }}>
                      Get Support
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Popular Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/support/help-center">
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                    <h3 className="font-semibold text-sm group-hover:text-finder-red transition-colors">Getting Started</h3>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/support/help-center">
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                    <h3 className="font-semibold text-sm group-hover:text-finder-red transition-colors">Proposals & Contracts</h3>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/support/help-center">
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                    <h3 className="font-semibold text-sm group-hover:text-finder-red transition-colors">Messaging</h3>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/support/help-center">
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(1, 81%, 53%)" }} />
                    <h3 className="font-semibold text-sm group-hover:text-finder-red transition-colors">Payments & Security</h3>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-12 text-center">
            <Card className="bg-emerald-50/80 backdrop-blur-sm border-emerald-200/50 inline-block">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-medium">All systems operational</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}