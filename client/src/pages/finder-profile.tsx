import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, User, Star, Briefcase, DollarSign, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type FinderProfile = {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  completedJobs: number;
  totalEarnings: string;
  rating: number;
  tokens: number;
  createdAt: string;
};

export default function FinderProfile() {
  const params = useParams();
  const { user } = useAuth();
  const finderId = params.finderId as string;
  
  const { data: finderProfile, isLoading } = useQuery<FinderProfile>({
    queryKey: ['/api/finders', finderId, 'profile'],
    enabled: !!finderId && !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-2 animate-pulse"></div>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!finderProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 text-center">
          <div className="max-w-md mx-auto">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Finder Not Found</h2>
            <p className="text-gray-600 mb-4">The finder profile you're looking for doesn't exist.</p>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const finderName = `${finderProfile.user.firstName} ${finderProfile.user.lastName}`;
  const memberSince = new Date(finderProfile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{finderName}</h1>
              <p className="text-gray-600">Finder Profile</p>
            </div>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg font-semibold">
                    {finderProfile.user.firstName.charAt(0)}
                    {finderProfile.user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{finderName}</CardTitle>
                  <p className="text-gray-600">Member since {memberSince}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(finderProfile.rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {finderProfile.rating.toFixed(1)} rating
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Jobs Completed */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {finderProfile.completedJobs}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</p>
                    </div>
                  </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${finderProfile.totalEarnings}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                    </div>
                  </div>
                </div>

                {/* Available Tokens */}
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {finderProfile.tokens}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Available Tokens</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span>{finderProfile.user.email}</span>
                  </div>
                  {finderProfile.user.phone && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="w-4 h-4 mr-2">📱</span>
                      <span>{finderProfile.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}