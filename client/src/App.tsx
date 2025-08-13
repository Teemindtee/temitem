import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ClientDashboard from "@/pages/client/dashboard";
import CreateRequest from "@/pages/client/create-request";
import RequestDetails from "@/pages/client/request-details";
import ViewProposals from "@/pages/client/view-proposals";
import FinderDashboard from "@/pages/finder/dashboard";
import BrowseRequests from "@/pages/finder/browse-requests";
import AdminDashboard from "@/pages/admin/dashboard";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client/create-request" component={CreateRequest} />
      <Route path="/client/requests/:id" component={RequestDetails} />
      <Route path="/client/proposals" component={ViewProposals} />
      <Route path="/finder/dashboard" component={FinderDashboard} />
      <Route path="/finder/browse-requests" component={BrowseRequests} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
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
