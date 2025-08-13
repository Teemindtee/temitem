import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Users, Settings, FileText, LogOut, BarChart3, MessageSquare, DollarSign, Tags, Edit } from "lucide-react";

interface AdminHeaderProps {
  currentPage?: string;
}

export default function AdminHeader({ currentPage }: AdminHeaderProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: BarChart3, id: "dashboard" },
    { path: "/admin/users", label: "Users", icon: Users, id: "users" },
    { path: "/admin/requests", label: "Requests", icon: FileText, id: "requests" },
    { path: "/admin/categories", label: "Categories", icon: Tags, id: "categories" },
    { path: "/admin/withdrawals", label: "Withdrawals", icon: DollarSign, id: "withdrawals" },
    { path: "/admin/blog-posts", label: "Blog Posts", icon: Edit, id: "blog-posts" },
    { path: "/admin/settings", label: "Settings", icon: Settings, id: "settings" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-6">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">FinderMeister</span>
                  <span className="text-sm text-gray-500 ml-2">Admin</span>
                </div>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.id} href={item.path}>
                    <Button
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        currentPage === item.id 
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}