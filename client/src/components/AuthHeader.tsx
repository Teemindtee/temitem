import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Handshake, Menu, X } from "lucide-react";

interface AuthHeaderProps {
  currentPage: 'login' | 'register' | 'browse';
}

export function AuthHeader({ currentPage }: AuthHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-finder-red text-white px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 mr-8">
          <Handshake className="w-6 h-6" />
          <span className="text-xl font-bold">FinderMeister</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/browse-requests" 
            className={`hover:underline transition-all duration-200 ${
              currentPage === 'browse' ? 'bg-white text-finder-red px-3 py-1 rounded font-medium' : ''
            }`}
          >
            Browse Requests
          </Link>
          <Link 
            href="/login" 
            className={`hover:underline transition-all duration-200 ${
              currentPage === 'login' ? 'bg-white text-finder-red px-3 py-1 rounded font-medium' : ''
            }`}
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className={`hover:underline transition-all duration-200 ${
              currentPage === 'register' ? 'bg-white text-finder-red px-3 py-1 rounded font-medium' : ''
            }`}
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white hover:bg-finder-red-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-finder-red/70">
          <nav className="flex flex-col space-y-3 pt-4">
            <Link 
              href="/browse-requests" 
              className={`hover:bg-finder-red-dark px-3 py-2 rounded transition-colors duration-200 ${
                currentPage === 'browse' ? 'bg-white text-finder-red font-medium' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Requests
            </Link>
            <Link 
              href="/login" 
              className={`hover:bg-finder-red-dark px-3 py-2 rounded transition-colors duration-200 ${
                currentPage === 'login' ? 'bg-white text-finder-red font-medium' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Log In
            </Link>
            <Link 
              href="/register" 
              className={`hover:bg-finder-red-dark px-3 py-2 rounded transition-colors duration-200 ${
                currentPage === 'register' ? 'bg-white text-finder-red font-medium' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}