import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Cog, ChevronRight, FileEdit } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import ClientHeader from "@/components/client-header";
import logoImage from "@assets/findermeister logo real_1756395091374.jpg";

export default function ClientMobileDashboard() {
  const { user } = useAuth();

  const userName = user?.firstName || "Tosin";

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader currentPage="dashboard" />
      
      {/* Mobile Phone Frame - Match exact mockup */}
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-2xl border border-gray-200 rounded-2xl overflow-hidden relative mt-4">
        {/* User Profile Section */}
        <div className="bg-finder-red px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">👤</span>
              </div>
            </div>
            <span className="text-white text-xl font-semibold">{userName}</span>
          </div>
          <ChevronRight className="h-5 w-5 text-white" />
        </div>

        {/* Main Content Area */}
        <div className="px-4 py-6 bg-white flex-1">
          {/* Action Grid - Exact 2x2 Layout */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {/* Post a Request - Top Left */}
            <Link href="/client/create-find">
              <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-1 bg-white rounded mb-1"></div>
                    <div className="w-6 h-1 bg-white rounded mb-1"></div>
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-finder-red text-xs font-bold">+</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-semibold text-sm leading-tight">Post a</div>
                  <div className="text-gray-900 font-semibold text-sm leading-tight">Find</div>
                </div>
              </div>
            </Link>

            {/* View Proposals - Top Right */}
            <Link href="/client/proposals">
              <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center relative">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-semibold text-sm leading-tight">View</div>
                  <div className="text-gray-900 font-semibold text-sm leading-tight">Proposals</div>
                </div>
              </div>
            </Link>

            {/* My Contracts - Bottom Left */}
            <Link href="/client/browse-requests">
              <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <div className="flex flex-col space-y-1">
                    <div className="w-8 h-1 bg-white rounded"></div>
                    <div className="w-6 h-1 bg-white rounded"></div>
                    <div className="w-7 h-1 bg-white rounded"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-semibold text-sm leading-tight">My</div>
                  <div className="text-gray-900 font-semibold text-sm leading-tight">Contracts</div>
                </div>
              </div>
            </Link>

            {/* Settings - Bottom Right */}
            <Link href="/client/profile">
              <div className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-16 h-16 bg-finder-red rounded-xl flex items-center justify-center mb-3 shadow-sm">
                  <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center relative">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute -top-1 w-1 h-3 bg-white rounded"></div>
                    <div className="absolute -right-1 w-3 h-1 bg-white rounded"></div>
                    <div className="absolute -bottom-1 w-1 h-3 bg-white rounded"></div>
                    <div className="absolute -left-1 w-3 h-1 bg-white rounded"></div>
                    <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute bottom-0 right-0 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-semibold text-sm leading-tight">Settings</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Tagline - Positioned at bottom */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="text-center px-4">
            <p className="text-gray-500 text-base font-medium leading-snug">
              One successful find<br />
              at a time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}