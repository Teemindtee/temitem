import { Link } from "wouter";
import Navigation from "@/components/ui/navigation";
import MobileNav from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Handshake, Edit, Search, Check, User } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'client') {
      window.location.href = '/client/dashboard';
      return null;
    } else if (user.role === 'finder') {
      window.location.href = '/finder/dashboard';
      return null;
    } else if (user.role === 'admin') {
      window.location.href = '/admin/dashboard';
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-finder-red to-finder-red-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Trouble Finding a Product or Service?
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-red-100">
            Connect with expert finders who can help you search for what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-finder-red hover:bg-red-50 font-semibold px-8 py-4 text-lg shadow-lg"
              >
                Get Started as Client
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-finder-red font-semibold px-8 py-4 text-lg"
              >
                Become a Finder
              </Button>
            </Link>
          </div>
          <div className="mt-12 text-red-100">
            <p className="text-lg font-medium">One successful find at a time</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-finder-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-finder-text mb-16">
            How FinderMeister Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-finder-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-finder-text">
                1. Post Your Request
              </h3>
              <p className="text-finder-text-light">
                Describe what you're looking for, set your budget, and specify your requirements.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-finder-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-finder-text">
                2. Expert Finders Propose
              </h3>
              <p className="text-finder-text-light">
                Professional finders review your request and submit detailed proposals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-finder-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-finder-text">
                3. Get Your Results
              </h3>
              <p className="text-finder-text-light">
                Choose the best proposal and let our finder locate exactly what you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section id="signup" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-finder-text mb-16">
            Join FinderMeister
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Client Registration */}
            <Card className="border-2 border-gray-200 hover:border-finder-red transition-colors cursor-pointer">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-finder-text mb-2">
                    I need something found
                  </h3>
                  <p className="text-finder-text-light">
                    Post requests and connect with expert finders
                  </p>
                </div>
                <Link href="/register?type=client">
                  <Button className="w-full bg-finder-red text-white hover:bg-finder-red-dark font-semibold py-3">
                    Sign Up as Client
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Finder Registration */}
            <Card className="border-2 border-gray-200 hover:border-finder-red transition-colors cursor-pointer">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-finder-text mb-2">
                    I can find things
                  </h3>
                  <p className="text-finder-text-light">
                    Browse requests and earn money finding items
                  </p>
                </div>
                <Link href="/register?type=finder">
                  <Button className="w-full bg-finder-red text-white hover:bg-finder-red-dark font-semibold py-3">
                    Sign Up as Finder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-finder-text text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Handshake className="w-8 h-8" />
                <span className="text-xl font-bold">FinderMeister</span>
              </div>
              <p className="text-gray-400">
                Connecting clients with expert finders for successful product and service discovery.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><Link href="/register?type=client" className="hover:text-white transition-colors">Post a Request</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Finders</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register?type=finder" className="hover:text-white transition-colors">Become a Finder</Link></li>
                <li><Link href="/finder/browse-requests" className="hover:text-white transition-colors">Browse Requests</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Earnings</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tips & Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FinderMeister. All rights reserved. One successful find at a time.</p>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
