import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinderHeader } from "@/components/finder-header";
import { SupportWidget } from "@/components/support-widget";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Coins, 
  CreditCard, 
  Clock, 
  CheckCircle,
  Star,
  Zap,
  Shield,
  ArrowLeft,
  Loader2
} from "lucide-react";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

interface PaystackResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export default function TokenPurchase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch token packages
  const { data: packages = [], isLoading } = useQuery<TokenPackage[]>({
    queryKey: ['/api/tokens/packages'],
    enabled: !!user
  });

  // Fetch current finder profile with token balance
  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  // Initialize payment
  const initializePayment = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({ packageId })
      });
      
      return response;
    },
    onSuccess: (data: PaystackResponse) => {
      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const handlePurchase = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setIsProcessing(true);
    initializePayment.mutate(pkg.id);
  };

  // Check for payment callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const status = urlParams.get('status');

    if (reference && status) {
      if (status === 'success') {
        toast({
          title: "Payment Successful!",
          description: "Your tokens have been added to your account.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/finder/profile'] });
      } else if (status === 'cancelled') {
        toast({
          title: "Payment Cancelled",
          description: "Your payment was cancelled.",
          variant: "destructive",
        });
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading token packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Tokens</h1>
          <p className="text-gray-600">Choose a token package to submit proposals</p>
        </div>

        {/* Current Balance */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Balance</h3>
                <p className="text-gray-600">Available tokens for proposals</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Coins className="w-6 h-6 text-orange-500" />
                  <span className="text-3xl font-bold text-orange-600">
                    {(finder as any)?.tokenBalance || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative border-2 transition-all duration-200 hover:shadow-lg ${
                pkg.popular 
                  ? 'border-red-500 shadow-md' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-red-600 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">
                  {pkg.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Coins className="w-8 h-8 text-orange-500" />
                    <span className="text-4xl font-bold text-gray-900">{pkg.tokens}</span>
                  </div>
                  <p className="text-gray-600 text-sm">tokens</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₦{pkg.price.toLocaleString()}
                  </div>
                  <p className="text-gray-500 text-sm">
                    ₦{Math.round(pkg.price / pkg.tokens).toLocaleString()} per token
                  </p>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isProcessing}
                  className={`w-full ${
                    pkg.popular 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {isProcessing && selectedPackage?.id === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Secure Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">Multiple Payment Options</h3>
                <p className="text-sm text-gray-600">
                  Pay with cards, bank transfers, USSD, or mobile money
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Encrypted</h3>
                <p className="text-sm text-gray-600">
                  All payments are processed securely through Paystack
                </p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-2">Instant Delivery</h3>
                <p className="text-sm text-gray-600">
                  Tokens are added to your account immediately after payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SupportWidget context="tokens" />
    </div>
  );
}