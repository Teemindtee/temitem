
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  MapPin, 
  Mail, 
  Phone, 
  MessageSquare,
  ArrowRight,
  Clock,
  Users,
  Shield
} from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-finder-red rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Contact Us</h1>
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
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions or need support? We're here to help you succeed on FinderMeister.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                  <Users className="w-6 h-6 mr-3 text-finder-red" />
                  FinderMeister Innovations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office Address</h3>
                    <p className="text-gray-600">
                      18 Back of Road Safety Office<br />
                      Moniya, Ibadan<br />
                      Nigeria
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <a 
                      href="mailto:findermeisterinnovations@gmail.com"
                      className="text-finder-red hover:underline"
                    >
                      findermeisterinnovations@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                    <a 
                      href="tel:+2337039391065"
                      className="text-finder-red hover:underline"
                    >
                      +233-7039391065
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                  <MessageSquare className="w-6 h-6 mr-3 text-finder-red" />
                  Follow Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="https://twitter.com/findermeister" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">X</span>
                    </div>
                    <span className="text-gray-900 font-medium">@findermeister</span>
                  </a>

                  <a 
                    href="https://facebook.com/findermeister" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">f</span>
                    </div>
                    <span className="text-gray-900 font-medium">@findermeister</span>
                  </a>

                  <a 
                    href="https://instagram.com/findermeister" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">IG</span>
                    </div>
                    <span className="text-gray-900 font-medium">@findermeister</span>
                  </a>

                  <a 
                    href="https://tiktok.com/@findermeisterinnovations" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">TT</span>
                    </div>
                    <span className="text-gray-900 font-medium text-sm">@findermeisterinnovations</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Support Options */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Need Immediate Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/support">
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-finder-red/10 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-finder-red" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-finder-red transition-colors">
                        Visit Support Center
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Browse our help articles and submit support tickets
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-finder-red transition-colors" />
                  </div>
                </Link>

                <Link href="/support/contact">
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Submit Support Ticket
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Get personalized help for your account or technical issues
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card className="bg-gradient-to-r from-finder-red to-finder-red/80 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Our Commitment</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3" />
                    <span>Email responses within 24 hours</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    <span>Phone support during business hours</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    <span>Dedicated account managers for enterprise</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Our Office</h3>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Interactive map coming soon<br />
                    18 Back of Road Safety Office, Moniya, Ibadan
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
