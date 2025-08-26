import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import ClientHeader from "@/components/client-header";
import { 
  Search, 
  ArrowLeft, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Banknote, 
  Tag,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink
} from "lucide-react";
import type { Category } from "@shared/schema";

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);

  // Redirect if not authenticated or not a client
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Only clients can create finds
    if (user.role !== 'client') {
      navigate("/"); // Redirect to home page
      return;
    }
  }, [user, navigate]);

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user
  });

  // Fetch admin settings for high budget thresholds
  const { data: adminSettings } = useQuery<{[key: string]: string}>({
    queryKey: ['/api/admin/settings'],
    enabled: !!user
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('findermeister_token');
      const formDataObj = new FormData();
      
      // Add text fields to FormData
      formDataObj.append('title', data.title);
      formDataObj.append('description', data.description);
      formDataObj.append('category', data.category);
      formDataObj.append('budgetMin', data.budgetMin);
      formDataObj.append('budgetMax', data.budgetMax);
      formDataObj.append('timeframe', data.timeframe);
      formDataObj.append('clientId', data.clientId);
      if (data.location) formDataObj.append('location', data.location);
      if (data.requirements) formDataObj.append('requirements', data.requirements);
      
      // Add files to FormData
      selectedFiles.forEach((file) => {
        formDataObj.append('attachments', file);
      });

      const response = await fetch("/api/client/finds", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Don't set Content-Type, let browser handle it for multipart/form-data
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create find");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/finds'] });
      
      toast({
        title: "Find Posted Successfully!",
        description: "Your find is now live and visible to finders.",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        minBudget: "",
        maxBudget: "",
        timeframe: "",
        location: "",
        requirements: ""
      });
      
      setSelectedFiles([]);
      setStep(1);
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate("/client/dashboard");
      }, 1500);
    },
    onError: (error: any) => {
      // Check if this is a findertokens error with purchase info
      if (error.needsToPurchaseTokens && error.purchaseUrl) {
        toast({
          variant: "destructive",
          title: "Insufficient Findertokens",
          description: error.message,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(error.purchaseUrl);
              }}
              className="bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Buy Tokens
            </Button>
          ),
        });
      } else if (error.message && (error.message.includes("findertokens") || error.message.includes("Insufficient"))) {
        toast({
          variant: "destructive",
          title: "Insufficient Findertokens",
          description: error.message + " Go to Token Management to purchase findertokens.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate("/client/tokens");
              }}
              className="bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Buy Tokens
            </Button>
          ),
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Post Find",
          description: error.message || "Please try again later",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in title and description",
      });
      return;
    }

    // Validate category selection
    if (!formData.category || formData.category === 'loading' || formData.category === 'none') {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a valid category",
      });
      return;
    }

    // Validate budget
    if (!formData.minBudget || !formData.maxBudget) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both minimum and maximum budget",
      });
      return;
    }
    
    const minBudget = parseInt(formData.minBudget);
    const maxBudget = parseInt(formData.maxBudget);

    if (isNaN(minBudget) || isNaN(maxBudget)) {
      toast({
        variant: "destructive",
        title: "Invalid Budget",
        description: "Please enter valid numbers for budget",
      });
      return;
    }

    if (minBudget >= maxBudget) {
      toast({
        variant: "destructive",
        title: "Invalid Budget Range",
        description: "Maximum budget must be higher than minimum budget",
      });
      return;
    }

    // Validate timeframe
    if (!formData.timeframe) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a timeframe",
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
      location: formData.location,
      requirements: formData.requirements,
      clientId: user?.id
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast({
        variant: "destructive",
        title: "Too Many Files",
        description: "You can upload a maximum of 5 files",
      });
      return;
    }
    
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    if (validFiles.length !== files.length) {
      toast({
        variant: "destructive",
        title: "File Size Error",
        description: "Some files exceed the 10MB limit and were not added",
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate basic info before proceeding
      if (!formData.title || !formData.description || !formData.category) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields",
        });
        return;
      }
    }
    if (step === 2) {
      // Validate detailed info before proceeding
      if (!formData.minBudget || !formData.maxBudget || !formData.timeframe) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in budget and timeframe",
        });
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ClientHeader currentPage="create-find" />

      {/* Mobile Progress Bar */}
      <div className="bg-white/60 border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className={`flex items-center flex-shrink-0 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                1
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:block">Info</span>
            </div>
            <div className={`flex-1 h-0.5 sm:h-1 rounded-full mx-2 sm:mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            
            {/* Step 2 */}
            <div className={`flex items-center flex-shrink-0 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                2
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:block">Details</span>
            </div>
            <div className={`flex-1 h-0.5 sm:h-1 rounded-full mx-2 sm:mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            
            {/* Step 3 */}
            <div className={`flex items-center flex-shrink-0 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                3
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:block">Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Post a New Find</h1>
          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Tell finders exactly what you need help finding and connect with the right experts
          </p>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">What are you looking for?</h2>
                    <p className="text-sm sm:text-base text-slate-600">Start with the basics - we'll gather more details next</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Find Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Find a reliable graphic designer for logo design"
                        className="h-12 sm:h-12 text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                        <Tag className="w-4 h-4 mr-2 text-blue-600" />
                        Category *
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger className="h-12 sm:h-12 text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Choose the best category for your find" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                          ) : categories.length > 0 ? (
                            categories
                              .filter(category => category.isActive)
                              .map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="none" disabled>No categories available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide specific details about what you're looking for, any requirements, and what success looks like..."
                        className="min-h-[120px] sm:min-h-[140px] text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 sm:pt-6">
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continue to Details
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Detailed Information */}
              {step === 2 && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Project Details</h2>
                    <p className="text-sm sm:text-base text-slate-600">Help finders understand your budget and timeline</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <Label htmlFor="minBudget" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                          <Banknote className="w-4 h-4 mr-2 text-green-600" />
                          Min Budget (₦) *
                        </Label>
                        <Input
                          id="minBudget"
                          name="minBudget"
                          type="number"
                          required
                          min="1000"
                          value={formData.minBudget}
                          onChange={handleInputChange}
                          placeholder="5000"
                          className="h-12 text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxBudget" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                          <Banknote className="w-4 h-4 mr-2 text-green-600" />
                          Max Budget (₦) *
                        </Label>
                        <Input
                          id="maxBudget"
                          name="maxBudget"
                          type="number"
                          required
                          min="1000"
                          value={formData.maxBudget}
                          onChange={handleInputChange}
                          placeholder="25000"
                          className="h-12 text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                        />
                      </div>
                    </div>

                    {/* High Budget Warning */}
                    {adminSettings && formData.maxBudget && parseInt(formData.maxBudget) >= parseInt(adminSettings.highBudgetThreshold || "100000") && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-purple-800 mb-1">High Budget Posting</h4>
                            <p className="text-sm text-purple-700 mb-2">
                              Your budget (₦{parseInt(formData.maxBudget).toLocaleString()}) qualifies as a high-budget posting. 
                              This requires <strong>{adminSettings.highBudgetTokenCost || "5"} findertokens</strong> to post.
                            </p>
                            <p className="text-xs text-purple-600">
                              High-budget posts get priority visibility and attract experienced finders.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="timeframe" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                        <Clock className="w-4 h-4 mr-2 text-orange-600" />
                        Timeline *
                      </Label>
                      <Select value={formData.timeframe} onValueChange={(value) => handleSelectChange("timeframe", value)}>
                        <SelectTrigger className="h-12 text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-orange-500 focus:ring-orange-500/20">
                          <SelectValue placeholder="When do you need this completed?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3 days">1-3 days (Urgent)</SelectItem>
                          <SelectItem value="1 week">Within 1 week</SelectItem>
                          <SelectItem value="2 weeks">Within 2 weeks</SelectItem>
                          <SelectItem value="1 month">Within 1 month</SelectItem>
                          <SelectItem value="2-3 months">2-3 months</SelectItem>
                          <SelectItem value="flexible">Flexible timeline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                        <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Lagos, Nigeria or Remote/Online"
                        className="h-12 text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">Leave blank if location doesn't matter</p>
                    </div>

                    <div>
                      <Label htmlFor="requirements" className="text-slate-700 font-semibold mb-2 block text-sm sm:text-base">
                        Special Requirements
                      </Label>
                      <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        placeholder="Any specific skills, certifications, tools, or other requirements..."
                        className="min-h-[100px] text-sm sm:text-lg bg-white/80 border-slate-200 focus:border-slate-500 focus:ring-slate-500/20 resize-none"
                      />
                    </div>

                    {/* Mobile-optimized File Upload */}
                    <div>
                      <Label className="text-slate-700 font-semibold flex items-center mb-2 text-sm sm:text-base">
                        <Upload className="w-4 h-4 mr-2 text-indigo-600" />
                        Supporting Files
                      </Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 sm:p-6 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                        <div className="text-center">
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mx-auto mb-2" />
                          <Label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">Upload files</span>
                            <span className="text-slate-500 text-sm sm:text-base"> or tap here</span>
                          </Label>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                          />
                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Images, PDFs, documents up to 10MB each (max 5 files)
                          </p>
                        </div>
                        
                        {selectedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 p-2"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t border-slate-200 gap-3 sm:gap-0">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Review & Post
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Review Your Find</h2>
                    <p className="text-sm sm:text-base text-slate-600">Double-check everything looks good before posting</p>
                  </div>

                  {/* Review Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 sm:p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{formData.title}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs sm:text-sm">
                        {formData.category}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2 text-sm sm:text-base">Description</h4>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{formData.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-xs sm:text-sm font-medium text-slate-900">
                          ₦{parseInt(formData.minBudget || "0").toLocaleString()} - ₦{parseInt(formData.maxBudget || "0").toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">Budget</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1" />
                        <div className="text-xs sm:text-sm font-medium text-slate-900">{formData.timeframe}</div>
                        <div className="text-xs text-slate-500">Timeline</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs sm:text-sm font-medium text-slate-900">
                          {formData.location || "Any location"}
                        </div>
                        <div className="text-xs text-slate-500">Location</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mx-auto mb-1" />
                        <div className="text-xs sm:text-sm font-medium text-slate-900">{selectedFiles.length}</div>
                        <div className="text-xs text-slate-500">Files</div>
                      </div>
                    </div>

                    {formData.requirements && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium text-slate-700 mb-2 text-sm sm:text-base">Special Requirements</h4>
                          <p className="text-slate-600 text-sm sm:text-base">{formData.requirements}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Important Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1 text-sm sm:text-base">Important Notice</h4>
                      <p className="text-xs sm:text-sm text-amber-700">
                        Once posted, your find will be visible to all finders on the platform. 
                        You'll receive proposals and can communicate with interested finders through our messaging system.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t border-slate-200 gap-3 sm:gap-0">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Edit
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createRequestMutation.isPending}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {createRequestMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Posting Find...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Post My Find
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}