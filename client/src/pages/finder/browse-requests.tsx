import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Handshake, Search, Filter, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import type { Request } from "@shared/schema";

export default function BrowseRequests() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ['/api/finder/requests'],
    enabled: !!user
  });

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || request.category === categoryFilter;
    const matchesBudget = !budgetFilter || 
      (budgetFilter === "under-100" && parseInt(request.budgetMax || "0") < 100) ||
      (budgetFilter === "100-500" && parseInt(request.budgetMax || "0") >= 100 && parseInt(request.budgetMax || "0") <= 500) ||
      (budgetFilter === "over-500" && parseInt(request.budgetMax || "0") > 500);
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

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
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/finder/dashboard" className="hover:underline">Dashboard</Link>
            <span className="bg-white text-red-600 px-3 py-1 rounded font-medium">Browse Requests</span>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-600"
            >
              Log Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <Link href="/finder/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Requests</h1>
          <p className="text-gray-600">Find opportunities that match your skills and interests.</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="product">Product Search</SelectItem>
                    <SelectItem value="service">Service Provider</SelectItem>
                    <SelectItem value="vendor">Vendor/Supplier</SelectItem>
                    <SelectItem value="location">Location/Venue</SelectItem>
                    <SelectItem value="information">Information Research</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Budget Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Budget</SelectItem>
                    <SelectItem value="under-100">Under $100</SelectItem>
                    <SelectItem value="100-500">$100 - $500</SelectItem>
                    <SelectItem value="over-500">Over $500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Request List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            filteredRequests.map((request: Request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{request.title}</h3>
                      <p className="text-gray-600 mb-4">{request.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>${request.budgetMin} - ${request.budgetMax}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(request.createdAt || "").toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Filter className="w-4 h-4 mr-1" />
                          <span className="capitalize">{request.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col items-end">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium mb-3 ${
                        request.status === 'open' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status === 'open' ? 'Open' : 'In Progress'}
                      </span>
                      <Link href={`/finder/requests/${request.id}`}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}