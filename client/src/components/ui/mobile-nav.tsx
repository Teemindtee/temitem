import { Link, useLocation } from "wouter";
import { Home, Search, Plus, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNav() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location === path;

  const getDashboardPath = () => {
    if (user?.role === 'client') return '/client/dashboard';
    if (user?.role === 'finder') return '/finder/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getPostPath = () => {
    if (user?.role === 'client') return '/client/create-find';
    // Finders cannot post finds, redirect to browse
    if (user?.role === 'finder') return '/finder/browse-finds';
    return '/';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 h-16">
        <Link href={getDashboardPath()}>
          <button className={`flex flex-col items-center justify-center space-y-1 ${
            isActive(getDashboardPath()) ? 'text-finder-red' : 'text-gray-500'
          }`}>
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        
        <Link href="/finder/browse-requests">
          <button className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/finder/browse-requests') ? 'text-finder-red' : 'text-gray-500'
          }`}>
            <Search className="w-5 h-5" />
            <span className="text-xs">Browse</span>
          </button>
        </Link>
        
        <Link href={getPostPath()}>
          <button className={`flex flex-col items-center justify-center space-y-1 ${
            isActive(getPostPath()) ? 'text-finder-red' : 'text-gray-500'
          }`}>
            {user?.role === 'client' ? <Plus className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            <span className="text-xs">{user?.role === 'client' ? 'Post' : 'Browse'}</span>
          </button>
        </Link>
        
        <Link href={getDashboardPath()}>
          <button className={`flex flex-col items-center justify-center space-y-1 ${
            isActive(getDashboardPath()) ? 'text-finder-red' : 'text-gray-500'
          }`}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
