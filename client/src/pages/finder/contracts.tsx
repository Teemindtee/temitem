import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderHeader } from "@/components/finder-header";
import { SupportWidget } from "@/components/support-widget";
import { useAuth } from "@/hooks/use-auth";
import { DollarSign, Clock, CheckCircle, Upload, ExternalLink, MapPin } from "lucide-react";
import type { Find } from "@shared/schema";



export default function FinderContracts() {
  const { user } = useAuth();

  const { data: finds = [], isLoading } = useQuery<Find[]>({
    queryKey: ['/api/finder/finds'],
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="contracts" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading available finds...</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="contracts" />

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Finds</h1>
          <p className="text-gray-600">Browse and submit proposals for available opportunities.</p>
        </div>

        {finds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No finds available</h3>
              <p className="text-gray-600 mb-6">Check back later for new opportunities to earn.</p>
              <Link href="/finder/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {finds.map((find) => (
              <Link key={find.id} href={`/finder/finds/${find.id}`}>
                <Card className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">
                          {find.title}
                        </CardTitle>
                        <p className="text-gray-600 line-clamp-2">
                          {find.description}
                        </p>
                      </div>
                      <Badge variant={find.status === 'open' ? 'default' : 'secondary'}>
                        {find.status}
                      </Badge>
                    </div>
                  </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-green-600">
                        <DollarSign className="w-5 h-5 mr-1" />
                        <span className="font-semibold text-lg">${find.budgetMin} - ${find.budgetMax}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {find.timeframe || "Flexible"}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {find.category}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {find.findertokenCost} findertoken{find.findertokenCost !== 1 ? 's' : ''}
                      </Badge>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SupportWidget context="contracts" />
    </div>
  );
}