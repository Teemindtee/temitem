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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">This page is only accessible by clients.</p>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">My Finds</h1>
              </div>
              <div className="text-xs sm:text-sm text-slate-500">Loading...</div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/70 backdrop-blur-sm rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-white/70 backdrop-blur-sm rounded-2xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">My Finds</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                onClick={() => navigate("/client/create-find")}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Find</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.total}</div>
              <div className="text-xs sm:text-sm text-slate-600">Total Finds</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.active}</div>
              <div className="text-xs sm:text-sm text-slate-600">Active Finds</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.totalProposals}</div>
              <div className="text-xs sm:text-sm text-slate-600">Total Proposals</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-slate-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search your finds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40 bg-white border-slate-200">
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
                  <SelectTrigger className="w-full sm:w-40 bg-white border-slate-200">
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
                    className="flex-1 sm:flex-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1 sm:flex-none"
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
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardContent className="py-16 text-center">
              {searchQuery || selectedCategory ? (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-600 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                    }}
                    variant="outline"
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No finds yet</h3>
                  <p className="text-slate-600 mb-6">
                    Create your first find to connect with talented finders.
                  </p>
                  <Button 
                    onClick={() => navigate("/client/create-find")}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Find
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
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
                  className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/client/finds/${find.id}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </Badge>
                      <div className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(find.createdAt))} ago
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg sm:text-xl text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {find.title}
                    </CardTitle>
                    
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {find.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Budget and Timeline */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-xs text-slate-500">Budget</div>
                            <div className="text-sm font-semibold text-green-600">
                              ₦{parseInt(find.budgetMin || "0").toLocaleString()} - ₦{parseInt(find.budgetMax || "0").toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="text-xs text-slate-500">Timeline</div>
                            <div className="text-sm font-semibold text-amber-600">
                              {find.timeframe || "Flexible"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category and Proposals */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          <Badge variant="outline" className="text-xs capitalize border-purple-200 text-purple-700">
                            {find.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{proposalCount} proposals</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>127 views</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group-hover:bg-blue-700"
                          size="sm"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {filteredFinds.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
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