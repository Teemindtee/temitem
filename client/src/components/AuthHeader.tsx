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
    <header className="bg-red-600 text-white px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Handshake className="w-6 h-6" />
          <span className="text-xl font-bold">FinderMeister</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/browse-requests" 
            className={`hover:underline transition-all duration-200 ${
              currentPage === 'browse' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''
            }`}
          >
            Browse Requests
          </Link>
          <Link 
            href="/register" 
            className={`hover:underline transition-all duration-200 ${
              currentPage === 'register' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''
            }`}
          >
            Sign Up
          </Link>
          <Link 
            href="/login" 
            className={`hover:underline transition-all duration-200 ${
              currentPage === 'login' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''
            }`}
          >
            Log In
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white hover:bg-red-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-red-500">
          <nav className="flex flex-col space-y-3 pt-4">
            <Link 
              href="/browse-requests" 
              className={`hover:bg-red-700 px-3 py-2 rounded transition-colors duration-200 ${
                currentPage === 'browse' ? 'bg-white text-red-600 font-medium' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Requests
            </Link>
            <Link 
              href="/register" 
              className={`hover:bg-red-700 px-3 py-2 rounded transition-colors duration-200 ${
                currentPage === 'register' ? 'bg-white text-red-600 font-medium' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className={`hover:bg-red-700 px-3 py-2 rounded transition-colors duration-200 ${
                currentPage === 'login' ? 'bg-white text-red-600 font-medium' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Log In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}