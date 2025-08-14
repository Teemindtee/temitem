import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Search } from "lucide-react";
import ClientHeader from "@/components/client-header";
import type { Request } from "@shared/schema";

export default function BrowseRequests() {
  const { user, logout } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ['/api/client/requests'],
    enabled: !!user
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // Get time ago string
  const getTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Posted less than an hour ago";
    if (diffInHours === 1) return "Posted 1 hour ago";
    if (diffInHours < 24) return `Posted ${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Posted 1 day ago";
    return `Posted ${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="browse-requests" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">My Requests</h1>
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
          >
            Filter
          </Button>
        </div>

        {/* Request Cards */}
        <div className="space-y-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">Check back later for new requests.</p>
            </div>
          ) : (
            requests.map((request: Request) => (
              <Link key={request.id} href={`/client/requests/${request.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{request.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{request.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">You</span>
                    </div>
                    <span className="text-gray-500 text-sm">{getTimeAgo(request.createdAt || "")}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}