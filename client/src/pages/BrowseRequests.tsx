import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthHeader } from "@/components/AuthHeader";
import { Search, MapPin, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location?: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
  };
  proposalCount: number;
  status: string;
}

export default function BrowseRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.filter((req: Request) => req.status === 'open'));
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader currentPage="browse" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading requests...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader currentPage="browse" />
      
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Browse Open Requests
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover opportunities to help clients find what they need. Join as a finder to start earning.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Requests Grid */}
      <section className="container mx-auto px-4 py-8">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'No requests match your search.' : 'No open requests available.'}
            </div>
            <Link href="/register?type=client">
              <Button className="bg-finder-red hover:bg-finder-red-dark">
                Post a Request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-finder-red/20 text-finder-red-dark">
                      {request.category}
                    </Badge>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {request.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {request.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Budget: ₦{request.budget.toLocaleString()}
                    </div>
                    
                    {request.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        {request.location}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      Posted by: {request.client.firstName} {request.client.lastName}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {request.proposalCount} proposal{request.proposalCount !== 1 ? 's' : ''} received
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href="/register?type=finder" className="flex-1">
                      <Button className="w-full bg-finder-red hover:bg-finder-red-dark">
                        Sign Up to Bid
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Login
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-finder-red text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Start Finding?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join our community of skilled finders and start earning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=finder">
              <Button size="lg" className="bg-white text-finder-red hover:bg-gray-100">
                Sign Up as Finder
              </Button>
            </Link>
            <Link href="/register?type=client">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-finder-red">
                Post a Request
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}