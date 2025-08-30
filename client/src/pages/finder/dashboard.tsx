import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinderHeader } from "@/components/finder-header";
import { SupportWidget } from "@/components/support-widget";
import { useAuth } from "@/hooks/use-auth";
import { Search, Banknote, Clock, Trophy, Plus, Coins } from "lucide-react";
import type { Find, Proposal, User } from "@shared/schema";
import { useTranslation } from "react-i18next";

export default function FinderDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: availableFinds = [], isLoading: findsLoading } = useQuery<Find[]>({
    queryKey: ['/api/finder/finds'],
    enabled: !!user
  });

  const { data: myProposals = [], isLoading: proposalsLoading } = useQuery<any[]>({
    queryKey: ['/api/finder/proposals'],
    enabled: !!user
  });

  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  if (findsLoading || proposalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader currentPage="dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finder-red mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('common.loading_dashboard', 'Loading dashboard...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader currentPage="dashboard" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('navigation.welcome_back', 'Welcome back')}, {user?.firstName || 'Finder'}!</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('dashboard.overview_text', 'Find opportunities and grow your finder business.')}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-green-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-green-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('common.total_earnings', 'Total Earnings')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">₦{((finder as any)?.totalEarnings || 0).toLocaleString()}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{t('common.all_time', 'All time')}</p>
            </CardContent>
          </Card>

          <Link href="/finder/browse-finds">
            <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="bg-blue-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('dashboard.available_finds', 'Available Finds')}</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{availableFinds.length}</p>
                <p className="text-gray-600 text-xs sm:text-sm">{t('dashboard.open_now', 'Open now')}</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-purple-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-purple-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('dashboard.completed_jobs', 'Completed Jobs')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{(finder as any)?.completedJobs || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{t('common.all_time', 'All time')}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-orange-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('dashboard.findertoken_balance', 'Findertoken Balance')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{(finder as any)?.findertokenBalance || 0}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{t('common.available', 'Available')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">{t('dashboard.new_finds', 'New Finds')}</CardTitle>
              <Link href="/finder/browse-finds">
                <Button variant="outline" size="sm">{t('common.view_all', 'View All')}</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableFinds.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('dashboard.no_finds_available', 'No new finds available.')}</p>
                  <p className="text-sm">{t('dashboard.check_back_soon', 'Check back soon for new opportunities!')}</p>
                </div>
              ) : (
                availableFinds.slice(0, 3).map((find: Find) => (
                  <div key={find.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{find.title}</h4>
                      <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full font-medium">
                        {t('common.new', 'New')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{find.description.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">{t('common.budget', 'Budget')}: ₦{parseInt(find.budgetMin || '0').toLocaleString()} - ₦{parseInt(find.budgetMax || '0').toLocaleString()}</span>
                      <Link href={`/finder/finds/${find.id}`}>
                        <Button size="sm" className="bg-finder-red hover:bg-finder-red-dark">{t('common.view', 'View')}</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* My Proposals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-gray-900">{t('dashboard.my_proposals', 'My Proposals')}</CardTitle>
              <Link href="/finder/proposals">
                <Button variant="outline" size="sm">{t('common.view_all', 'View All')}</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {myProposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('dashboard.no_proposals', 'No proposals submitted yet.')}</p>
                  <Link href="/finder/browse-finds" className="text-finder-red hover:underline font-medium">
                    {t('dashboard.browse_for_finds', 'Browse finds to get started')}
                  </Link>
                </div>
              ) : (
                myProposals.slice(0, 3).map((proposal: any) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{t('dashboard.proposal_id', 'Proposal #')}{proposal.id.substring(0, 8)}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-finder-red/20 text-finder-red-dark'
                      }`}>
                        {t(`common.status_${proposal.status}`, proposal.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{proposal.approach?.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">₦{parseInt(proposal.price).toLocaleString()}</span>
                      <Link href={`/finder/proposals/${proposal.id}`}>
                        <Button size="sm" variant="outline">{t('common.view', 'View')}</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <SupportWidget context="dashboard" />
    </div>
  );
}