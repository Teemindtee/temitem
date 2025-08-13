import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Cog, ChevronRight, FileEdit } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function ClientMobileDashboard() {
  const { user } = useAuth();

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Layout */}
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        {/* Header with User Info */}
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xl font-semibold text-white">{userName.split(' ')[0]}</span>
          </div>
          <ChevronRight className="h-6 w-6 text-white" />
        </div>

        {/* Dashboard Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Post a Request */}
            <Link href="/client/post-request">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <FileEdit className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 text-center">
                    Post a<br />Request
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* View Proposals */}
            <Link href="/client/view-proposals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <Eye className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 text-center">
                    View<br />Proposals
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* My Contracts */}
            <Link href="/client/browse-requests">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 text-center">
                    My<br />Contracts
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Settings */}
            <Link href="/client/profile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex flex-col">
                <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <Cog className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 text-center">
                    Settings
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Bottom Tagline */}
          <div className="text-center mt-16">
            <p className="text-gray-500 text-base font-medium">
              One successful find<br />
              at a time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}