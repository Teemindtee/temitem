import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Search, Star, Handshake, CheckCircle, Shield, Users } from "lucide-react";
import logoImage from "@assets/findermeister logo real_1756395091374.jpg";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src={logoImage}
                alt="FinderMeister Logo"
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded-full"
              />
              <span className="text-xl lg:text-2xl font-bold text-gray-900">FinderMeister</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                How it Works
              </a>
              <a href="#finder-path" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Finder Path
              </a>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-finder-red hover:bg-finder-red-dark text-white px-6 py-2 font-medium">
                  Sign Up
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link href="/register">
                <Button size="sm" className="bg-finder-red hover:bg-finder-red-dark text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 lg:py-20">
            <div className="text-center max-w-4xl mx-auto">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Trouble Finding a<br className="hidden sm:block" />
                <span className="text-finder-red"> Product or Service?</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Post your request. Finders will help you source what you need, safely and easily.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-finder-red hover:bg-finder-red-dark text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                    Post a Find
                  </Button>
                </Link>
                <Link href="/register/finder">
                  <Button size="lg" variant="outline" className="border-2 border-finder-red text-finder-red hover:bg-finder-red hover:text-white px-8 py-4 text-lg font-semibold transition-all">
                    Become a Finder
                  </Button>
                </Link>
              </div>

              {/* Service Icons */}
              <div className="flex justify-center space-x-8 lg:space-x-12 opacity-60">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500 hidden lg:block">Home</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7Z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500 hidden lg:block">Services</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500 hidden lg:block">Shopping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Three simple steps to get what you need
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-finder-red text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-10 h-10 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-finder-red">
                    <span className="text-finder-red font-bold text-sm">1</span>
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Post a Request
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Clients describe what they need
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-finder-red text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-10 h-10 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-finder-red">
                    <span className="text-finder-red font-bold text-sm">2</span>
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Get Proposals
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Finders suggest how they'll help
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-finder-red text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                    <Handshake className="w-10 h-10 lg:w-12 lg:h-12" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-finder-red">
                    <span className="text-finder-red font-bold text-sm">3</span>
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Choose a Finder<br />& Pay Safely
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Funds held in escrow until delivery
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="w-6 h-6 text-finder-red" />
                <span className="text-gray-700 font-medium">Your money is safe until you confirm delivery</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Star className="w-6 h-6 text-finder-red" />
                <span className="text-gray-700 font-medium">Reviews & ratings build trust</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Users className="w-6 h-6 text-finder-red" />
                <span className="text-gray-700 font-medium">No special skills needed to be a Finder</span>
              </div>
            </div>
          </div>
        </section>

      {/* Finder Path Section */}
      <section id="finder-path" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Finder Path
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Build your reputation and unlock new opportunities
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
              {[
                { level: 'Novice', color: 'bg-gray-400' },
                { level: 'Pathfinder', color: 'bg-blue-500' },
                { level: 'Seeker', color: 'bg-green-500' },
                { level: 'Meister', color: 'bg-purple-500' },
                { level: 'GrandMeister', color: 'bg-finder-red' }
              ].map((item, index) => (
                <div key={item.level} className="text-center group">
                  <div className={`w-16 h-16 lg:w-20 lg:h-20 ${item.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Users className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                    {item.level}
                  </h3>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 mb-8">
                Join our today and become part of Nigeria's fastest-growing finder community
              </p>
              <Link href="/register/finder">
                <Button size="lg" className="bg-finder-red hover:bg-finder-red-dark text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  Start Your Finder Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <img
                  src={logoImage}
                  alt="FinderMeister Logo"
                  className="w-10 h-10 object-contain rounded-full"
                />
                <span className="text-xl font-bold">FinderMeister</span>
              </div>
              <div className="flex flex-wrap justify-center gap-8 text-gray-400 mb-8">
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="/support/contact" className="hover:text-white transition-colors">Contact Us</a>
                <a href="/support" className="hover:text-white transition-colors">Support</a>
                <a href="/support/help-center" className="hover:text-white transition-colors">FAQ</a>
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms-and-conditions" className="hover:text-white transition-colors">TOS</a>
              </div>
              <p className="text-gray-400">
                © 2025 FinderMeister. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      {/* Mobile Menu - Simple overlay for mobile */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white rounded-full shadow-lg p-4 flex justify-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-gray-600">
              Log In
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="sm" className="text-gray-600">
              How it Works
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}