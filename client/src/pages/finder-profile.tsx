import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderLevelBadge } from "@/components/finder-level-badge";
import AdminHeader from "@/components/admin-header";
import { ArrowLeft, User, Star, Award, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import type { Finder } from "@shared/schema";

export default function FinderProfileView() {
  const [match, params] = useRoute("/finder-profile/:userId");
  const userId = params?.userId;

  // Always use the direct ID endpoint for simplicity
  const apiEndpoint = `/api/admin/finder-profile/${userId}`;

  const { data: finderData, isLoading, error } = useQuery<any>({
    queryKey: [apiEndpoint],
    enabled: !!userId
  });


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!finderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Finder not found</p>
          <Link href="/admin/users">
            <Button className="mt-4">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${finderData.user?.firstName || 'Unknown'} ${finderData.user?.lastName || 'User'}`.trim();

  // Get star rating display
  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-6 h-6 ${i < rating ? 'text-finder-red fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="users" />

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        {/* Beautiful Profile Card - Like the Design */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Red Header */}
            <div className="bg-finder-red px-8 py-6 text-center">
              <h1 className="text-white text-2xl font-bold">FinderMeister</h1>
            </div>
            
            {/* Profile Content */}
            <div className="px-8 py-8 text-center bg-white">
              {/* Profile Picture Placeholder */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <FinderLevelBadge 
                    completedJobs={finderData.jobsCompleted || 0} 
                    className="text-sm px-3 py-1"
                  />
                </div>
              </div>
              
              {/* Name */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{fullName}</h2>
              
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {getStarRating(Math.round(parseFloat(finderData.averageRating || "5.0")))}
              </div>
              
              {/* Completed Jobs */}
              <p className="text-lg text-gray-600 mb-4 font-medium">
                {finderData.jobsCompleted || 0} Completed Finds
              </p>
              
              {/* Testimonials/Bio */}
              <div className="space-y-2 mb-8">
                {finderData.bio && (
                  <p className="text-gray-700 italic">"{finderData.bio}"</p>
                )}
                {!finderData.bio && (
                  <>
                    <p className="text-gray-700 italic">"Extremely reliable and efficient"</p>
                    <p className="text-gray-700 italic">"Went above and beyond to help me out!"</p>
                  </>
                )}
              </div>
              
              {/* Admin View Badge */}
              <Badge className="w-full bg-blue-600 text-white font-bold py-2 text-lg">
                Admin View
              </Badge>
            </div>
          </div>
        </div>

        {/* Detailed Information Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{finderData.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{finderData.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified Status</p>
                  <div className="flex items-center gap-2">
                    {finderData.user?.isVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-finder-red" />
                    )}
                    <span className={finderData.user?.isVerified ? 'text-green-600' : 'text-finder-red'}>
                      {finderData.user?.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Availability</p>
                  <p className="text-gray-900 capitalize">{finderData.availability || 'Not specified'}</p>
                </div>
              </div>

              {finderData.skills && finderData.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {finderData.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Performance Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-finder-red">{finderData.jobsCompleted || 0}</div>
                  <div className="text-sm text-gray-600">Jobs Completed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${finderData.totalEarned || 0}</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{parseFloat(finderData.averageRating || "5.0").toFixed(1)}/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${finderData.hourlyRate || 0}</div>
                  <div className="text-sm text-gray-600">Hourly Rate</div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Member Since</p>
                <p className="text-gray-900">
                  {finderData.user?.createdAt ? new Date(finderData.user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}