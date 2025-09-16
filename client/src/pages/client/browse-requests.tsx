import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ClientHeader from "@/components/client-header";
import { 
  Search, 
  Filter,
  Plus,
  Clock,
  DollarSign,
  Eye,
  Tag,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Grid,
  List,
  ChevronDown,
  SortAsc,
  SortDesc,
  Briefcase,
  Target,
  Award,
  Zap,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface FindItem {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
  timeframe?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  clientId: string;
  _count?: {
    proposals: number;
  };
}

export default function BrowseRequests() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data: finds = [], isLoading } = useQuery<FindItem[]>({
    queryKey: ['/api/client/finds'],
    enabled: !!user
  });

  const { data: categories = [] } = useQuery<Array<{id: string, name: string}>>({
    queryKey: ['/api/categories'],
    enabled: !!user
  });

  // Filter and sort finds
  const filteredFinds = finds
    .filter(find => {
      const matchesSearch = find.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           find.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === "all" || find.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'budget-high':
          return parseInt(b.budgetMax || "0") - parseInt(a.budgetMax || "0");
        case 'budget-low':
          return parseInt(a.budgetMin || "0") - parseInt(b.budgetMin || "0");
        case 'proposals':
          return (b._count?.proposals || 0) - (a._count?.proposals || 0);
        default:
          return 0;
      }
    });

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: '🚀', label: 'Active' };
      case 'completed':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✅', label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌', label: 'Cancelled' };
      default:
        return { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '⏳', label: 'Pending' };
    }
  };

  // Calculate stats
  const stats = {
    total: finds.length,
    active: finds.filter(f => f.status === 'active').length,
    completed: finds.filter(f => f.status === 'completed').length,
    totalProposals: finds.reduce((sum, f) => sum + (f._count?.proposals || 0), 0)
  };

  // Redirect if not authenticated or not client
  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96 p-8 text-center">
          <div className="w-20 h-20 bg-finder-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-finder-red" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only accessible by clients.</p>
          <Button onClick={() => navigate("/login")} className="bg-finder-red hover:bg-finder-red/90">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientHeader currentPage="finds" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white border border-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-24 bg-white border border-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-white border border-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="finds" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-finder-red/10 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-finder-red" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Finds</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stats.active}</div>
              <div className="text-xs sm:text-sm text-gray-500">Active Finds</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stats.totalProposals}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Proposals</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-gray-500">Completed Finds</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search your finds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-finder-red focus:ring-finder-red/20"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="budget-high">Highest Budget</SelectItem>
                    <SelectItem value="budget-low">Lowest Budget</SelectItem>
                    <SelectItem value="proposals">Most Proposals</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 sm:flex-none ${viewMode === "grid" ? "bg-finder-red hover:bg-finder-red/90" : ""}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`flex-1 sm:flex-none ${viewMode === "list" ? "bg-finder-red hover:bg-finder-red/90" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredFinds.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="py-16 text-center">
              {searchQuery || selectedCategory ? (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                    }}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-finder-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-finder-red" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No finds yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first find to connect with talented finders.
                  </p>
                  <Button 
                    onClick={() => navigate("/client/create-find")}
                    className="bg-finder-red hover:bg-finder-red/90 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Find
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredFinds.map((find) => {
              const statusInfo = getStatusInfo(find.status);
              const proposalCount = find._count?.proposals || 0;
              
              return (
                <Card 
                  key={find.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/client/finds/${find.id}`)}
                >
                  {/* Header */}
                  <div className="p-5 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <Badge 
                        variant="secondary"
                        className={`text-xs font-medium px-2.5 py-1 ${
                          find.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                          find.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          find.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {find.status === 'active' ? '🚀 Active' :
                         find.status === 'completed' ? '✅ Completed' :
                         find.status === 'cancelled' ? '❌ Cancelled' :
                         '⏳ Pending'}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(find.createdAt))} ago
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-finder-red transition-colors leading-tight">
                      {find.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {find.description}
                    </p>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <div className="space-y-4">
                      {/* Budget and Timeline */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 font-medium">Budget</div>
                          <div className="text-sm font-semibold text-green-600">
                            ₦{parseInt(find.budgetMin || "0").toLocaleString()} - ₦{parseInt(find.budgetMax || "0").toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 font-medium">Timeline</div>
                          <div className="text-sm font-semibold text-gray-700">
                            {find.timeframe || "Flexible"}
                          </div>
                        </div>
                      </div>

                      {/* Category and Stats */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize border-finder-red/20 text-finder-red bg-finder-red/5"
                        >
                          {find.category}
                        </Badge>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{proposalCount} {proposalCount === 1 ? 'proposal' : 'proposals'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button 
                          className="w-full bg-finder-red hover:bg-finder-red/90 text-white transition-all duration-200 text-sm font-medium"
                          size="sm"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {filteredFinds.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredFinds.length} of {finds.length} finds
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}