import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { 
  Handshake, 
  User, 
  Wallet, 
  CreditCard, 
  Shield, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  FileText,
  Search,
  Home
} from "lucide-react";

interface FinderHeaderProps {
  currentPage?: string;
}

export function FinderHeader({ currentPage }: FinderHeaderProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-red-600 text-white px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Handshake className="w-6 h-6" />
          <span className="text-lg sm:text-xl font-bold">FinderMeister</span>
        </Link>
        
        <nav className="flex items-center space-x-2 sm:space-x-6">
          {/* Desktop Navigation */}
          <Link 
            href="/finder/dashboard" 
            className={`hidden sm:inline hover:underline ${currentPage === 'dashboard' ? 'font-semibold' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/finder/browse-requests" 
            className={`hidden sm:inline hover:underline ${currentPage === 'browse' ? 'font-semibold' : ''}`}
          >
            Browse Requests
          </Link>
          <Link 
            href="/finder/contracts" 
            className={`hidden sm:inline hover:underline ${currentPage === 'contracts' ? 'font-semibold' : ''}`}
          >
            My Contracts
          </Link>

          {/* Mobile Navigation Menu */}
          <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="sm:hidden text-white hover:bg-white/10 p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/finder/dashboard" className="flex items-center cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/finder/browse-requests" className="flex items-center cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Requests
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/finder/contracts" className="flex items-center cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  My Contracts
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-white hover:bg-white/10 px-2 sm:px-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white text-red-600 text-sm font-semibold">
                    {user?.firstName ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/finder/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/finder/tokens" className="flex items-center cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  Token Balance
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/finder/withdrawals" className="flex items-center cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Withdrawal Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/finder/security" className="flex items-center cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}