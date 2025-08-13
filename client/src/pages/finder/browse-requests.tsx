import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/ui/navigation";
import MobileNav from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/lib/auth";
import SubmitProposalModal from "@/components/modals/submit-proposal";
import { Clock, User, Tag, DollarSign } from "lucide-react";

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  timeframe: string;
  clientId: string;
  createdAt: string;
  status: string;
}

export default function BrowseRequests() {
  const { isAuthenticated } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    budgetRange: '',
    timeframe: '',
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/requests'],
    queryFn: () => fetch('/api/requests', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated,
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ['/api/tokens/balance'],
    queryFn: () => fetch('/api/tokens/balance', {
      headers: AuthService.getAuthHeaders(),
    }).then(res => res.json()),
    enabled: isAuthenticated,
  });

  const filteredRequests = requests?.filter((request: Request) => {
    if (filters.category && request.category !== filters.category) return false;
    if (filters.budgetRange) {
      const [min, max] = filters.budgetRange.split('-').map(Number);
      if (max) {
        if (request.budgetMin > max || request.budgetMax < min) return false;
      } else {
        if (request.budgetMin < min) return false;
      }
    }
    if (filters.timeframe && request.timeframe !== filters.timeframe) return false;
    return true;
  }) || [];

  const handleSubmitProposal = (request: Request) => {
    if (!tokenBalance || tokenBalance.balance < 1) {
      alert('You need at least 1 token to submit a proposal. Please buy tokens first.');
      return;
    }
    setSelectedRequest(request);
    setIsProposalModalOpen(true);
  };

  const getTimeframeLabel = (timeframe: string) => {
    const labels: { [key: string]: string } = {
      'asap': 'ASAP',
      'week': 'Within a week',
      'two_weeks': 'Within 2 weeks',
      'month': 'Within a month',
      'no_rush': 'No rush',
    };
    return labels[timeframe] || timeframe;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'electronics': 'Electronics',
      'healthcare': 'Healthcare',
      'fashion': 'Fashion & Accessories',
      'home': 'Home & Garden',
      'automotive': 'Automotive',
      'books': 'Books & Media',
      'services': 'Services',
      'other': 'Other',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-finder-gray">
      <Navigation />

      {/* Header */}
      <div className="bg-finder-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Browse Requests</h1>
          <p className="text-xl text-red-100">
            Find opportunities to help clients locate what they need
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="fashion">Fashion & Accessories</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="books">Books & Media</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.budgetRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, budgetRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Budgets</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="50-200">$50 - $200</SelectItem>
                  <SelectItem value="200-500">$200 - $500</SelectItem>
                  <SelectItem value="500">$500+</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.timeframe} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Timeframes</SelectItem>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="two_weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="no_rush">No rush</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setFilters({ category: '', budgetRange: '', timeframe: '' })}
                variant="outline"
                className="border-finder-red text-finder-red hover:bg-red-50"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Token Balance Info */}
        {tokenBalance && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Token Balance:</strong> {tokenBalance.balance} tokens
              {tokenBalance.balance < 1 && (
                <span className="text-red-600 ml-2">
                  (You need at least 1 token to submit proposals)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request: Request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-finder-text mb-2">
                        {request.title}
                      </h3>
                      <p className="text-finder-text-light mb-3">
                        {request.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-finder-text-light">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Client ID: {request.clientId.slice(-8)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Posted {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          {getCategoryLabel(request.category)}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Budget: ${request.budgetMin} - ${request.budgetMax}
                        </span>
                      </div>
                      {request.timeframe && (
                        <div className="mt-2">
                          <Badge variant="outline">
                            {getTimeframeLabel(request.timeframe)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleSubmitProposal(request)}
                        className="bg-finder-red text-white hover:bg-finder-red-dark font-medium"
                        disabled={!tokenBalance || tokenBalance.balance < 1}
                      >
                        Submit Proposal
                      </Button>
                      <span className="text-sm text-finder-text-light text-center">
                        Cost: 1 token
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-finder-text-light">
                  {filters.category || filters.budgetRange || filters.timeframe 
                    ? 'No requests match your current filters.' 
                    : 'No active requests available at the moment.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Proposal Modal */}
      <SubmitProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => {
          setIsProposalModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <MobileNav />
    </div>
  );
}
