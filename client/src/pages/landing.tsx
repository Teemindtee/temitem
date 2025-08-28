import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Search, Star, Handshake } from "lucide-react";
import logoImage from "@assets/Findermeister logo_1755186313310.jpg";

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

  // Check if mobile view is needed
  const isMobile = window.innerWidth < 640;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-First Layout */}
        <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl relative">
          {/* Header with Logo */}
          <div className="bg-finder-red px-6 py-4 flex items-center rounded-t-3xl">
            <img 
              src={logoImage} 
              alt="FinderMeister Logo" 
              className="w-12 h-12 rounded-full object-contain bg-white p-1 mr-3 shadow-lg" 
            />
            <h1 className="text-2xl font-bold text-white">FinderMeister</h1>
          </div>

          {/* Main Content */}
          <div className="px-6 py-12 flex flex-col justify-center min-h-[calc(100vh-80px)]">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                Trouble Finding<br />
                a Product or<br />
                Service?
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Connect with finders who can help you search for what you need.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-16">
              <Link href="/register">
                <Button className="w-full bg-finder-red hover:bg-finder-red-dark text-white py-4 text-lg font-semibold rounded-xl shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Bottom Tagline */}
            <div className="text-center mt-auto">
              <p className="text-gray-500 text-base font-medium">
                One successful find<br />
                at a time
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-finder-red text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="FinderMeister Logo" 
              className="w-12 h-12 rounded-full object-contain bg-white p-1 shadow-lg border-2 border-white/20" 
            />
            <span className="text-xl font-bold">FinderMeister</span>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#how-it-works" className="hover:underline">How it Works</a>
            <Link href="/login" className="hover:underline">Log In</Link>
            <Link href="/register">
              <Button variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-finder-red font-medium">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Trouble Finding a<br />
                Product or Service?
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with finders who can help<br />
                you search for what you need.
              </p>
              <Link href="/register">
                <Button className="bg-finder-red hover:bg-finder-red-dark text-white px-8 py-3 text-lg font-medium rounded-lg">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="bg-finder-red rounded-full w-48 h-48 flex items-center justify-center">
                <Handshake className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-finder-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M16 13H8"/>
                  <path d="M16 17H8"/>
                  <path d="M10 9H8"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Post a Request
              </h3>
              <p className="text-gray-600">
                Clients describe the product or service they're looking for.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-finder-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Get Proposals
              </h3>
              <p className="text-gray-600">
                Finders interested in your request will submit proposals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-finder-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Choose a Finder
              </h3>
              <p className="text-gray-600">
                Compare proposals and select the right finder for th job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center space-x-8 text-gray-600">
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
            <a href="#" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="text-center text-gray-600 mt-4">
            <a href="#" className="hover:text-gray-900">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}