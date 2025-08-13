import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Handshake, User, Settings, Lock, LogOut, Menu, X } from "lucide-react";

interface ClientHeaderProps {
  currentPage?: string;
}

export default function ClientHeader({ currentPage }: ClientHeaderProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-red-600 text-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Handshake className="w-6 h-6" />
          <span className="text-xl font-bold">FinderMeister</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link 
                href="/client/dashboard" 
                className={`hover:underline ${currentPage === 'dashboard' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/client/browse-requests" 
                className={`hover:underline ${currentPage === 'browse-requests' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''}`}
              >
                Browse Requests
              </Link>
              <Link 
                href="/client/proposals" 
                className={`hover:underline ${currentPage === 'proposals' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''}`}
              >
                View Proposals
              </Link>
              <Link 
                href="/messages" 
                className={`hover:underline ${currentPage === 'messages' ? 'bg-white text-red-600 px-3 py-1 rounded font-medium' : ''}`}
              >
                Messages
              </Link>
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-red-700 p-2">
                    <User className="w-5 h-5 mr-2" />
                    {user.firstName || 'Profile'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/client/profile" className="flex items-center w-full cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/client/change-password" className="flex items-center w-full cursor-pointer">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:underline cursor-pointer">How it Works</Link>
              <Link href="/login" className="text-white hover:underline cursor-pointer">Log In</Link>
              <Link href="/register" className="text-white hover:underline cursor-pointer">Sign Up</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-red-500 mt-4 pt-4">
          <nav className="flex flex-col space-y-3">
            {user ? (
              <>
                <Link 
                  href="/client/dashboard" 
                  className={`block py-2 px-3 rounded ${currentPage === 'dashboard' ? 'bg-white text-red-600 font-medium' : 'hover:bg-red-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/client/browse-requests" 
                  className={`block py-2 px-3 rounded ${currentPage === 'browse-requests' ? 'bg-white text-red-600 font-medium' : 'hover:bg-red-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Requests
                </Link>
                <Link 
                  href="/client/proposals" 
                  className={`block py-2 px-3 rounded ${currentPage === 'proposals' ? 'bg-white text-red-600 font-medium' : 'hover:bg-red-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Proposals
                </Link>
                <Link 
                  href="/messages" 
                  className={`block py-2 px-3 rounded ${currentPage === 'messages' ? 'bg-white text-red-600 font-medium' : 'hover:bg-red-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <div className="border-t border-red-500 pt-3 mt-3">
                  <div className="flex items-center py-2 px-3 text-white font-medium">
                    <User className="w-5 h-5 mr-2" />
                    {user.firstName || 'Profile'}
                  </div>
                  <Link 
                    href="/client/profile" 
                    className="block py-2 px-6 hover:bg-red-700 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Edit Profile
                  </Link>
                  <Link 
                    href="/client/change-password" 
                    className="block py-2 px-6 hover:bg-red-700 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Lock className="w-4 h-4 mr-2 inline" />
                    Change Password
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center w-full py-2 px-6 hover:bg-red-700 rounded text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 px-3 hover:bg-red-700 rounded" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
                <Link href="/login" className="block py-2 px-3 hover:bg-red-700 rounded" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link href="/register" className="block py-2 px-3 hover:bg-red-700 rounded" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}