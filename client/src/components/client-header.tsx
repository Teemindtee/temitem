import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Handshake, User, Settings, Lock, LogOut, Menu, X, FileText, MessageSquare, Search, HelpCircle, Plus, Coins } from "lucide-react";
import logoImage from "@assets/findermeister logo real_1756395091374.jpg";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface ClientHeaderProps {
  currentPage?: string;
}

export default function ClientHeader({ currentPage }: ClientHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-finder-red text-white px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img
            src={logoImage}
            alt="FinderMeister Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain bg-white p-1"
          />
          <span className="text-lg sm:text-xl font-bold">FinderMeister</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {user ? (
            <>
              <Link
                href="/client/dashboard"
                className={`flex items-center space-x-1 hover:underline px-2 py-1 rounded transition-colors text-sm ${currentPage === 'dashboard' ? 'bg-white text-finder-red font-medium' : 'hover:bg-finder-red-dark'}`}
              >
                <Handshake className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">{t('navigation.dashboard')}</span>
              </Link>
              <Link
                href="/client/create-find"
                className={`flex items-center space-x-1 hover:underline px-2 py-1 rounded transition-colors text-sm ${currentPage === 'create-find' ? 'bg-white text-finder-red font-medium' : 'hover:bg-finder-red-dark'}`}
              >
                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">{t('navigation.create_find')}</span>
              </Link>
              <Link
                href="/client/finds"
                className={`flex items-center space-x-1 hover:underline px-2 py-1 rounded transition-colors text-sm ${currentPage === 'finds' ? 'bg-white text-finder-red font-medium' : 'hover:bg-finder-red-dark'}`}
              >
                <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">{t('navigation.my_finds')}</span>
              </Link>
              <Link
                href="/client/browse-finds"
                className={`flex items-center space-x-1 hover:underline px-2 py-1 rounded transition-colors text-sm ${currentPage === 'browse-finds' ? 'bg-white text-finder-red font-medium' : 'hover:bg-finder-red-dark'}`}
              >
                <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">Browse Finds</span>
              </Link>
              <Link
                href="/client/contracts"
                className={`flex items-center space-x-1 hover:underline px-2 py-1 rounded transition-colors text-sm ${currentPage === 'contracts' ? 'bg-white text-finder-red font-medium' : 'hover:bg-finder-red-dark'}`}
              >
                <Handshake className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">Contracts</span>
              </Link>
              <Link
                href="/client/tokens"
                className={`flex items-center space-x-1 hover:underline px-2 py-1 rounded transition-colors text-sm ${currentPage === 'tokens' ? 'bg-white text-finder-red font-medium' : 'hover:bg-finder-red-dark'}`}
              >
                <Coins className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">Findertokens</span>
              </Link>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-finder-red-dark p-2">
                    <User className="w-5 h-5 mr-2" />
                    {user.firstName || 'Profile'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="flex items-center w-full cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuItem asChild>
                    <Link href="/support" className="flex items-center w-full cursor-pointer">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help Center
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

        {/* Mobile User Actions - visible when authenticated */}
        {user && (
          <div className="lg:hidden flex items-center space-x-3">
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:bg-white/10 p-2 rounded-full">
                  <User className="w-5 h-5" />
                </button>
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
                <DropdownMenuItem asChild>
                  <Link href="/support" className="flex items-center w-full cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-white hover:bg-white/10 p-2 rounded-full"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-finder-red text-white">
            <nav className="flex flex-col space-y-3 mt-6">
            {user ? (
              <>
                <Link
                  href="/client/dashboard"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'dashboard' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Handshake className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/client/create-find"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'create-find' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Find</span>
                </Link>
                <Link
                  href="/client/finds"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'finds' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Finds</span>
                </Link>
                <Link
                  href="/client/browse-finds"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'browse-finds' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Finds</span>
                </Link>
                <Link
                  href="/client/contracts"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'contracts' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Handshake className="w-4 h-4" />
                  <span>Contracts</span>
                </Link>
                <Link
                  href="/client/tokens"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'tokens' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Coins className="w-4 h-4" />
                  <span>Findertokens</span>
                </Link>
                <Link
                  href="/messages"
                  className={`flex items-center space-x-2 py-2 px-3 rounded ${currentPage === 'messages' ? 'bg-white text-finder-red font-medium' : 'hover:bg-white/10'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </Link>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex items-center py-2 px-3 text-white font-medium">
                    <User className="w-5 h-5 mr-2" />
                    {user.firstName || 'Profile'}
                  </div>
                  <Link
                    href="/client/profile"
                    className="block py-2 px-6 hover:bg-white/10 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Edit Profile
                  </Link>
                  <Link
                    href="/client/change-password"
                    className="block py-2 px-6 hover:bg-white/10 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Lock className="w-4 h-4 mr-2 inline" />
                    Change Password
                  </Link>
                  <Link
                    href="/support"
                    className="block py-2 px-6 hover:bg-white/10 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HelpCircle className="w-4 h-4 mr-2 inline" />
                    Help Center
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center w-full py-2 px-6 hover:bg-white/10 rounded text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </button>

                  {/* Mobile Language Switcher */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <LanguageSwitcher variant="mobile" className="px-6" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 px-3 hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
                <Link href="/login" className="block py-2 px-3 hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link href="/register" className="block py-2 px-3 hover:bg-white/10 rounded" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}