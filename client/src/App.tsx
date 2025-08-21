import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import RegisterFinder from "@/pages/auth/register-finder";
import ClientDashboard from "@/pages/client/dashboard";
import CreateRequest from "@/pages/client/create-request";
import RequestDetails from "@/pages/client/request-details";
import ViewProposals from "@/pages/client/view-proposals";
import ClientBrowseRequests from "@/pages/client/browse-requests";
import ClientProfile from "@/pages/client/profile";
import ClientContracts from "@/pages/client/contracts";
import ContractDetails from "@/pages/client/contract-details";
import ChangePassword from "@/pages/client/change-password";
import FinderDashboard from "@/pages/finder/dashboard";
import FinderBrowseRequests from "@/pages/finder/browse-requests";
import FinderRequestDetails from "@/pages/finder/request-details";
import FinderProposals from "@/pages/finder/proposals";
import FinderProposalDetails from "@/pages/finder/proposal-details";
import ProposalDetail from "@/pages/client/proposal-detail";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminRequests from "@/pages/admin/requests";
import AdminCategories from "@/pages/admin/categories";
import AdminSettings from "@/pages/admin/settings";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminTokenManagement from "@/pages/admin/token-management";
import AdminBlogPosts from "@/pages/admin/blog-posts";
import AdminBlogPostCreate from "@/pages/admin/blog-post-create";
import AdminBlogPostEdit from "@/pages/admin/blog-post-edit";
import AdminFinderLevels from "@/pages/admin/finder-levels";
import AdminStrikeSystem from "@/pages/admin/StrikeSystem";
import AdminRestrictedWords from "@/pages/admin/restricted-words";
import BlogPost from "@/pages/blog-post";
import Messages from "@/pages/Messages";
import ConversationDetail from "@/pages/ConversationDetail";
import FinderPublicProfile from "@/pages/finder-profile";
import FinderProfile from "@/pages/finder/profile";
import FinderTokens from "@/pages/finder/tokens";
import FinderTokenPurchase from "@/pages/finder/token-purchase";
import FinderWithdrawals from "@/pages/finder/withdrawals";
import FinderSecurity from "@/pages/finder/security";
import FinderContracts from "@/pages/finder/contracts";
import FinderContractDetails from "@/pages/finder/contract-details";
import MobileLanding from "@/pages/mobile-landing";
import ClientMobileDashboard from "@/pages/client/mobile-dashboard";
import OrderSubmission from "@/pages/order-submission";
import OrderReview from "@/pages/order-review";
import SupportIndex from "@/pages/support/index";
import HelpCenter from "@/pages/support/help-center";
import ContactSupport from "@/pages/support/contact";
import BrowseRequests from "@/pages/BrowseRequests";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/mobile" component={MobileLanding} />
      <Route path="/browse-requests" component={BrowseRequests} />
      <Route path="/client/mobile-dashboard" component={ClientMobileDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/register/finder" component={RegisterFinder} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client/create-find" component={CreateRequest} />
      <Route path="/client/finds/:id" component={RequestDetails} />
      <Route path="/client/proposals" component={ViewProposals} />
      <Route path="/client/proposals/:id" component={ProposalDetail} />
      <Route path="/client/contracts" component={ClientContracts} />
      <Route path="/client/contracts/:contractId" component={ContractDetails} />
      <Route path="/client/browse-finds" component={ClientBrowseRequests} />
      <Route path="/client/browse-requests" component={ClientBrowseRequests} />
      <Route path="/client/finds" component={ClientBrowseRequests} />
      <Route path="/client/profile" component={ClientProfile} />
      <Route path="/client/change-password" component={ChangePassword} />
      <Route path="/finder/dashboard" component={FinderDashboard} />
      <Route path="/finder/browse-finds" component={FinderBrowseRequests} />
      <Route path="/finder/browse-requests" component={FinderBrowseRequests} />
      <Route path="/finder/finds/:id" component={FinderRequestDetails} />
      <Route path="/finder/requests/:id" component={FinderRequestDetails} />
      <Route path="/finder/proposals" component={FinderProposals} />
      <Route path="/finder/proposals/:id" component={FinderProposalDetails} />
      <Route path="/finder/contracts" component={FinderContracts} />
      <Route path="/finder/contracts/:contractId" component={FinderContractDetails} />
      <Route path="/finder/profile" component={FinderProfile} />
      <Route path="/finder-profile/:userId" component={FinderPublicProfile} />
      <Route path="/finder/tokens" component={FinderTokens} />
      <Route path="/finder/token-purchase" component={FinderTokenPurchase} />
      <Route path="/finder/withdrawals" component={FinderWithdrawals} />
      <Route path="/finder/security" component={FinderSecurity} />
      <Route path="/orders/submit/:contractId" component={OrderSubmission} />
      <Route path="/orders/review/:contractId" component={OrderReview} />
      <Route path="/support" component={SupportIndex} />
      <Route path="/support/help-center" component={HelpCenter} />
      <Route path="/support/contact" component={ContactSupport} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/requests" component={AdminRequests} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />
      <Route path="/admin/token-management" component={AdminTokenManagement} />
      <Route path="/admin/blog-posts" component={AdminBlogPosts} />
      <Route path="/admin/blog-posts/create" component={AdminBlogPostCreate} />
      <Route path="/admin/blog-posts/edit/:id" component={AdminBlogPostEdit} />
      <Route path="/admin/finder-levels" component={AdminFinderLevels} />
      <Route path="/admin/strike-system" component={AdminStrikeSystem} />
      <Route path="/admin/restricted-words" component={AdminRestrictedWords} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:conversationId" component={ConversationDetail} />
      <Route path="/finder-profile/:finderId" component={FinderPublicProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
