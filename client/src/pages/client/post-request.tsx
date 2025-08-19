import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/ui/navigation";
import MobileNav from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import ClientHeader from "@/components/client-header";

export default function PostRequest() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    timeframe: "",
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/my'] });
      toast({
        title: "Request posted successfully",
        description: "Your request is now live and finders can submit proposals.",
      });
      setLocation('/client/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Failed to post request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || user?.role !== 'client') {
    return <div>Access denied</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.budgetMin || !formData.budgetMax) {
      toast({
        title: "Budget required",
        description: "Please provide both minimum and maximum budget.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budgetMin: parseFloat(formData.budgetMin),
      budgetMax: parseFloat(formData.budgetMax),
      timeframe: formData.timeframe,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ClientHeader currentPage="create-find" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-finder-text">
              Post a Request
            </CardTitle>
            <p className="text-finder-text-light">
              Fill out the details of what you're looking for, and finders can submit proposals to help.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="What are you looking for?"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  className="focus:ring-finder-red focus:border-finder-red"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger className="focus:ring-finder-red focus:border-finder-red">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="fashion">Fashion & Accessories</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="books">Books & Media</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Provide detailed information about what you need found, including specifications, preferred brands, condition requirements, etc."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  className="focus:ring-finder-red focus:border-finder-red resize-none"
                />
              </div>

              <div>
                <Label>Budget Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetMin" className="text-sm">Minimum ($)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="50"
                      value={formData.budgetMin}
                      onChange={(e) => handleChange('budgetMin', e.target.value)}
                      required
                      className="focus:ring-finder-red focus:border-finder-red"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax" className="text-sm">Maximum ($)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="200"
                      value={formData.budgetMax}
                      onChange={(e) => handleChange('budgetMax', e.target.value)}
                      required
                      className="focus:ring-finder-red focus:border-finder-red"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={formData.timeframe} onValueChange={(value) => handleChange('timeframe', value)}>
                  <SelectTrigger className="focus:ring-finder-red focus:border-finder-red">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (1-2 days)</SelectItem>
                    <SelectItem value="week">Within a week</SelectItem>
                    <SelectItem value="two_weeks">Within 2 weeks</SelectItem>
                    <SelectItem value="month">Within a month</SelectItem>
                    <SelectItem value="no_rush">No rush</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-finder-red hover:bg-finder-red-dark font-semibold py-3"
                disabled={createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? "Posting Request..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}
