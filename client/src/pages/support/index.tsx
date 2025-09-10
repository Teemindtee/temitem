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
      </div>
    </div>
  );
}