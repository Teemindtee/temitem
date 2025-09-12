
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinderHeader } from "@/components/finder-header";
import { Search, ArrowLeft } from "lucide-react";
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Requests</h1>
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
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredFinds.length} find{filteredFinds.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <span className="text-sm font-medium text-finder-red">Open Requests</span>
        </div>

        {/* Request Table */}
        {filteredFinds.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No finds found</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Title</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Budget</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Posted</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFinds.map((find: Find, index) => (
                      <tr 
                        key={find.id} 
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div>
                            <h3 className="font-medium text-gray-900 hover:text-finder-red transition-colors cursor-pointer">
                              {find.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {find.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-green-600">
                            ₦{parseInt(find.budgetMin || "0").toLocaleString()} - ₦{parseInt(find.budgetMax || "0").toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">
                            {getTimeAgo(find.createdAt || "")}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link href={`/finder/finds/${find.id}`}>
                            <Button 
                              size="sm" 
                              className="bg-finder-red hover:bg-finder-red-dark text-white"
                            >
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredFinds.map((find: Find) => (
                  <div key={find.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      {/* Title and Action Row */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate hover:text-finder-red transition-colors cursor-pointer">
                            {find.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                            {find.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Link href={`/finder/finds/${find.id}`}>
                            <Button 
                              size="sm" 
                              className="bg-finder-red hover:bg-finder-red-dark text-white px-2 sm:px-3"
                            >
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden text-xs">View</span>
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        {/* Budget */}
                        <div>
                          <span className="text-gray-500 font-medium">Budget: </span>
                          <span className="font-semibold text-green-600">
                            ₦{parseInt(find.budgetMin || "0").toLocaleString()} - ₦{parseInt(find.budgetMax || "0").toLocaleString()}
                          </span>
                        </div>

                        {/* Posted Date */}
                        <div className="text-gray-600">
                          <span className="text-gray-500 font-medium">Posted: </span>
                          {getTimeAgo(find.createdAt || "")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
