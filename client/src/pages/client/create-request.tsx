import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Handshake, ArrowLeft } from "lucide-react";

export default function CreateRequest() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    minBudget: "",
    maxBudget: "",
    timeframe: "",
    location: "",
    requirements: ""
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('findermeister_token');
      const response = await fetch("/api/client/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests/my'] });
      toast({
        title: "Success!",
        description: "Your request has been posted successfully.",
      });
      navigate("/client/dashboard");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create request",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const minBudget = parseInt(formData.minBudget);
    const maxBudget = parseInt(formData.maxBudget);

    if (minBudget >= maxBudget) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Maximum budget must be higher than minimum budget",
      });
      return;
    }

    createRequestMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budgetMin: minBudget.toString(),
      budgetMax: maxBudget.toString(),
      timeframe: formData.timeframe,
      clientId: user?.id
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/client/dashboard" className="hover:underline">Dashboard</Link>
            <span className="bg-white text-red-600 px-3 py-1 rounded font-medium">Post Request</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="mb-8">
          <Link href="/client/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Request</h1>
          <p className="text-gray-600">Describe what you need help finding and connect with expert finders.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-700 font-medium">Request Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="What do you need help finding?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product Search</SelectItem>
                    <SelectItem value="service">Service Provider</SelectItem>
                    <SelectItem value="vendor">Vendor/Supplier</SelectItem>
                    <SelectItem value="location">Location/Venue</SelectItem>
                    <SelectItem value="information">Information Research</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Detailed Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide specific details about what you're looking for..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minBudget" className="text-gray-700 font-medium">Minimum Budget ($)</Label>
                  <Input
                    id="minBudget"
                    name="minBudget"
                    type="number"
                    required
                    min="1"
                    value={formData.minBudget}
                    onChange={handleInputChange}
                    placeholder="50"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxBudget" className="text-gray-700 font-medium">Maximum Budget ($)</Label>
                  <Input
                    id="maxBudget"
                    name="maxBudget"
                    type="number"
                    required
                    min="1"
                    value={formData.maxBudget}
                    onChange={handleInputChange}
                    placeholder="200"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timeframe" className="text-gray-700 font-medium">Timeline</Label>
                <Select value={formData.timeframe} onValueChange={(value) => handleSelectChange("timeframe", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How soon do you need this completed?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3 days">1-3 days (Urgent)</SelectItem>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="2-3 months">2-3 months</SelectItem>
                    <SelectItem value="flexible">Flexible timeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-700 font-medium">Location (if relevant)</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State or Online"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="requirements" className="text-gray-700 font-medium">Special Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements, preferences, or constraints..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-medium"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? "Posting..." : "Post Request"}
                </Button>
                <Link href="/client/dashboard">
                  <Button variant="outline" className="px-8 py-3">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}