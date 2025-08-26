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
import { useQuery } from "@tanstack/react-query";
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
  Home,
  MessageCircle,
  Clock
} from "lucide-react";
import logoImage from "@assets/Findermeister logo_1755186313310.jpg";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface FinderHeaderProps {
  currentPage?: string;
}

// Helper function to format currency
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount / 100); // Convert from kobo to naira
};

export function FinderHeader({ currentPage }: FinderHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch finder profile and pending earnings
  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user && user.role === 'finder'
  });

  const { data: pendingEarnings } = useQuery({
    queryKey: ['/api/finder/pending-earnings'],
    enabled: !!user && user.role === 'finder'
  });

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
        
        <nav className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Navigation */}
          <Link 
            href="/finder/dashboard" 
            className={`hidden md:inline hover:underline text-sm ${currentPage === 'dashboard' ? 'font-semibold' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/finder/browse-finds" 
            className={`hidden md:inline hover:underline text-sm ${currentPage === 'browse' ? 'font-semibold' : ''}`}
          >
            Browse Finds
          </Link>
          <Link 
            href="/finder/contracts" 
            className={`hidden md:inline hover:underline text-sm ${currentPage === 'contracts' ? 'font-semibold' : ''}`}
          >
            My Contracts
          </Link>

          {/* Mobile Navigation Menu */}
          <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="md:hidden text-white hover:bg-white/10 p-2"
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
                <Link href="/finder/browse-finds" className="flex items-center cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Finds
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

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-white hover:bg-white/10 px-2 sm:px-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white text-finder-red text-sm font-semibold">
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
                  
                  {/* Balance Information */}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 font-medium">Available:</span>
                      <span className="font-semibold text-green-700">
                        {finder?.availableBalance ? formatCurrency(finder.availableBalance) : '₦0.00'}
                      </span>
                    </div>
                    {pendingEarnings && pendingEarnings.contractCount > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-600 font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending:
                        </span>
                        <span className="font-semibold text-orange-700">
                          {formatCurrency(pendingEarnings.netAmount)}
                        </span>
                      </div>
                    )}
                    {pendingEarnings && pendingEarnings.contractCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {pendingEarnings.contractCount} contract{pendingEarnings.contractCount !== 1 ? 's' : ''} awaiting release
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/messages" className="flex items-center cursor-pointer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Messages
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/finder/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/finder/tokens" className="flex items-center cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  Findertoken Balance
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