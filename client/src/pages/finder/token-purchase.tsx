import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { Coins, CreditCard, ArrowLeft } from "lucide-react";

interface PricingInfo {
  pricePerToken: number; // in kobo/cents
  currency: string;
}

export default function TokenPurchase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokenAmount, setTokenAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  // Fetch pricing information from admin settings
  const { data: pricing, isLoading: pricingLoading } = useQuery<PricingInfo>({
    queryKey: ['/api/tokens/pricing'],
    enabled: !!user
  });

  // Fetch current finder profile with token balance
  const { data: finder } = useQuery({
    queryKey: ['/api/finder/profile'],
    enabled: !!user
  });

  const totalPrice = pricing ? (tokenAmount * pricing.pricePerToken) : 0;
  const totalPriceInNaira = totalPrice / 100; // Convert kobo to naira

  const handlePurchase = async () => {
    if (!pricing || tokenAmount <= 0) return;
    
    setLoading(true);
    
    try {
      // Simulate purchase process - in real implementation, integrate with Paystack
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Purchase Successful!",
        description: `You have purchased ${tokenAmount} findertokens for ₦${totalPriceInNaira.toFixed(2)}.`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTokenAmount(Math.max(1, Math.min(1000, value))); // Min 1, Max 1000 tokens
  };

  const presetAmounts = [10, 25, 50, 100];

  if (pricingLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FinderHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading pricing information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Purchase Findertokens</h1>
            <p className="text-muted-foreground">
              Buy findertokens to submit proposals and grow your finder business
            </p>
          </div>

          {/* Current Balance */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
                  <p className="text-muted-foreground">Available findertokens for proposals</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-6 h-6 text-orange-500" />
                    <span className="text-3xl font-bold text-orange-600">
                      {(finder as any)?.findertokenBalance || 0}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">findertokens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Purchase Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Buy Findertokens</CardTitle>
              <CardDescription>
                Current price: ₦{pricing ? (pricing.pricePerToken / 100).toFixed(2) : '0.00'} per token
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Token Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Number of Tokens</Label>
                <Input
                  id="tokenAmount"
                  type="number"
                  min="1"
                  max="1000"
                  value={tokenAmount}
                  onChange={handleTokenAmountChange}
                  className="text-lg"
                  placeholder="Enter token amount"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum: 1 token • Maximum: 1,000 tokens
                </p>
              </div>

              {/* Preset Amount Buttons */}
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={tokenAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTokenAmount(amount)}
                      className="w-full"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tokens:</span>
                  <span>{tokenAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per token:</span>
                  <span>₦{pricing ? (pricing.pricePerToken / 100).toFixed(2) : '0.00'}</span>
                </div>
                <div className="border-t border-muted pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Price:</span>
                    <span className="text-red-600">₦{totalPriceInNaira.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <Button 
                className="w-full text-lg py-6" 
                onClick={handlePurchase}
                disabled={loading || !pricing || tokenAmount <= 0}
                size="lg"
              >
                {loading ? (
                  "Processing Payment..." 
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Purchase {tokenAmount} Tokens for ₦{totalPriceInNaira.toFixed(2)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Findertokens Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-semibold">Submit Proposals</h4>
                  <p className="text-sm text-muted-foreground">Each proposal submission costs tokens as set by the admin</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-semibold">Get Selected</h4>
                  <p className="text-sm text-muted-foreground">When clients accept your proposal, you start working on their find</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-semibold">Earn Money</h4>
                  <p className="text-sm text-muted-foreground">Complete the work and get paid the agreed amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}