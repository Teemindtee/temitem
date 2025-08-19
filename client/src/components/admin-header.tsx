import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { User, Users, Settings, FileText, LogOut, BarChart3, MessageSquare, DollarSign, Tags, Edit, Menu, ChevronDown, TrendingUp, Coins } from "lucide-react";
import logoImage from "@assets/Findermeister logo_1755186313310.jpg";

interface AdminHeaderProps {
  currentPage?: string;
}

export default function AdminHeader({ currentPage }: AdminHeaderProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: BarChart3, id: "dashboard" },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: Users, 
      id: "users",
      hasDropdown: true,
      subItems: [
        { path: "/admin/users", label: "Manage Users", icon: Users, id: "users" },
        { path: "/admin/finder-levels", label: "Finder Levels", icon: TrendingUp, id: "finder-levels" },
        { path: "/admin/categories", label: "Categories", icon: Tags, id: "categories" },
        { path: "/admin/requests", label: "Finds", icon: FileText, id: "finds" },
        { path: "/admin/token-management", label: "Token Management", icon: Coins, id: "token-management" }
      ]
    },
    { path: "/admin/withdrawals", label: "Withdrawals", icon: DollarSign, id: "withdrawals" },
    { path: "/admin/blog-posts", label: "Blog Posts", icon: Edit, id: "blog-posts" },
    { path: "/admin/settings", label: "Settings", icon: Settings, id: "settings" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/admin/dashboard">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src={logoImage} 
                alt="FinderMeister Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain" 
              />
              <div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">FinderMeister</span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 hidden sm:inline">Admin</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.subItems && item.subItems.some(sub => currentPage === sub.id));
              
              if (item.hasDropdown && item.subItems) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`flex items-center space-x-2 ${
                          isActive 
                            ? "bg-finder-red hover:bg-finder-red-dark text-white" 
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <DropdownMenuItem key={subItem.id} asChild>
                            <Link href={subItem.path}>
                              <div className="flex items-center space-x-2 w-full cursor-pointer">
                                <SubIcon className="w-4 h-4" />
                                <span>{subItem.label}</span>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              return (
                <Link key={item.id} href={item.path}>
                  <Button
                    variant={currentPage === item.id ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      currentPage === item.id 
                        ? "bg-finder-red hover:bg-finder-red-dark text-white" 
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation & Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Logout */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="text-lg font-semibold text-gray-900 mb-4">Admin Panel</div>
                  
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id || (item.subItems && item.subItems.some(sub => currentPage === sub.id));
                    
                    if (item.hasDropdown && item.subItems) {
                      return (
                        <div key={item.id} className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 px-3 py-2 border-b">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                          </div>
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link key={subItem.id} href={subItem.path}>
                                <Button
                                  variant={currentPage === subItem.id ? "default" : "ghost"}
                                  className={`w-full justify-start space-x-3 pl-6 ${
                                    currentPage === subItem.id 
                                      ? "bg-finder-red hover:bg-finder-red-dark text-white" 
                                      : "text-gray-700 hover:text-gray-900"
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <SubIcon className="w-4 h-4" />
                                  <span>{subItem.label}</span>
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }
                    
                    return (
                      <Link key={item.id} href={item.path}>
                        <Button
                          variant={currentPage === item.id ? "default" : "ghost"}
                          className={`w-full justify-start space-x-3 ${
                            currentPage === item.id 
                              ? "bg-finder-red hover:bg-finder-red-dark text-white" 
                              : "text-gray-700 hover:text-gray-900"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  
                  <div className="border-t pt-4 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleLogout}
                      className="w-full justify-start space-x-3"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}