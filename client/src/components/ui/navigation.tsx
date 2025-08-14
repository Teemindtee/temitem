import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Handshake, Menu } from "lucide-react";
import logoImage from "@assets/Findermeister logo_1755186313310.jpg";
import { useState } from "react";

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-finder-red text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img 
                src={logoImage} 
                alt="FinderMeister Logo" 
                className="w-8 h-8 rounded-full object-contain bg-white p-1" 
              />
              <span className="text-xl font-bold">FinderMeister</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#how-it-works" className="hover:text-finder-red/70 transition-colors">
              How it Works
            </a>
            <Link href="/finder/browse-requests">
              <a className="hover:text-finder-red/70 transition-colors">Browse Requests</a>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Welcome, {user?.firstName}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-white text-white hover:bg-white hover:text-finder-red"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <a className="hover:text-finder-red/70 transition-colors">Log In</a>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white text-white hover:bg-white hover:text-finder-red"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
          
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-finder-red/60">
            <div className="flex flex-col space-y-2">
              <a href="#how-it-works" className="py-2 hover:text-finder-red/70 transition-colors">
                How it Works
              </a>
              <Link href="/finder/browse-requests">
                <a className="py-2 hover:text-finder-red/70 transition-colors">Browse Requests</a>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <span className="py-2 text-sm">Welcome, {user?.firstName}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-white text-white hover:bg-white hover:text-finder-red self-start"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <a className="py-2 hover:text-finder-red/70 transition-colors">Log In</a>
                  </Link>
                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-finder-red self-start"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
