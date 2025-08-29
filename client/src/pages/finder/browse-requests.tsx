import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinderHeader } from "@/components/finder-header";
import { Search, Filter, Calendar, Banknote, ArrowLeft } from "lucide-react";
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
                    <SelectItem value="under-100">Under ₦100</SelectItem>
                    <SelectItem value="100-500">₦100 - ₦500</SelectItem>
                    <SelectItem value="over-500">Over ₦500</SelectItem>
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
            <div className="text-center py-20">
              <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No finds found</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFinds.map((find: Find) => (
                <Card key={find.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white hover:bg-gray-50/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                              find.status === 'open' 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {find.status === 'open' ? '🟢 Open' : '🟡 In Progress'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-finder-red transition-colors">{find.title}</h3>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{find.description}</p>
                      
                      {/* Meta Information */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {find.client?.firstName?.[0] || 'A'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {find.client?.firstName && find.client?.lastName 
                                ? `${find.client.firstName} ${find.client.lastName}` 
                                : 'Anonymous Client'
                              }
                            </p>
                            <p className="text-xs text-gray-500">Client</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="font-medium">₦{parseInt(find.budgetMin || "0").toLocaleString()} - ₦{parseInt(find.budgetMax || "0").toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(find.createdAt || "").toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                            {find.category.replace('_', ' ').split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="pt-2 border-t border-gray-100">
                        <Link href={`/finder/finds/${find.id}`} className="block">
                          <Button className="w-full bg-finder-red hover:bg-finder-red-dark text-white font-medium py-2.5 transition-all duration-200 hover:shadow-lg group-hover:bg-finder-red-dark">
                            View Details →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}