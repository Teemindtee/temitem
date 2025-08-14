import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinderHeader } from "@/components/finder-header";
import { Search, Filter, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import type { Find } from "@shared/schema";

export default function BrowseFinds() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");

  const { data: finds = [], isLoading } = useQuery<Find[]>({
    queryKey: ['/api/finder/finds']
  });

  // Filter finds based on search and filters
  const filteredFinds = finds.filter(find => {
    const matchesSearch = find.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         find.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || find.category === categoryFilter;
    const matchesBudget = budgetFilter === "all" || 
      (budgetFilter === "under-100" && parseInt(find.budgetMax || "0") < 100) ||
      (budgetFilter === "100-500" && parseInt(find.budgetMax || "0") >= 100 && parseInt(find.budgetMax || "0") <= 500) ||
      (budgetFilter === "over-500" && parseInt(find.budgetMax || "0") > 500);
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading finds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="browse" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <Link href="/finder/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Finds</h1>
          <p className="text-gray-600 text-sm sm:text-base">Find opportunities that match your skills and interests.</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search finds..."
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
                    <SelectItem value="all">All Categories</SelectItem>
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
                    <SelectItem value="all">Any Budget</SelectItem>
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
            Showing {filteredFinds.length} find{filteredFinds.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Request List */}
        <div className="space-y-6">
          {filteredFinds.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No finds found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            filteredFinds.map((find: Find) => (
              <Card key={find.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">{find.title}</h3>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-3">{find.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 sm:px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                          find.status === 'open' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {find.status === 'open' ? 'Open' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>${find.budgetMin} - ${find.budgetMax}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{new Date(find.createdAt || "").toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="capitalize">{find.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Link href={`/finder/finds/${find.id}`}>
                        <Button className="bg-finder-red hover:bg-finder-red-dark text-white w-full sm:w-auto">
                          <span className="sm:hidden">View</span>
                          <span className="hidden sm:inline">View Details</span>
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