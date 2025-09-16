import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Handshake, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Assume categories are fetched from an API or context
// For demonstration purposes, let's mock categories data
const categories = [
  { id: "1", name: "Web Development", isActive: true },
  { id: "2", name: "Mobile Development", isActive: true },
  { id: "3", name: "UI/UX Design", isActive: true },
  { id: "4", name: "Data Science", isActive: false },
  { id: "5", name: "Cloud Computing", isActive: true },
  { id: "6", name: "DevOps", isActive: true },
];
const categoriesLoading = false;

export default function RegisterFinder() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bio: "",
    category: "", // Keep for backward compatibility if needed, but primarily use categories
    categories: [] as string[],
    skills: "",
    availability: "full-time"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please accept the terms and conditions",
      });
      return;
    }

    if (formData.categories.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one category",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare skills for backend if needed (e.g., comma-separated string)
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'finder',
        bio: formData.bio,
        category: formData.category, // Keep for backward compatibility
        categories: formData.categories, // New multiple categories field
        skills: skillsArray,
        availability: formData.availability
      });

      toast({
        title: "Success!",
        description: "Your finder account has been created successfully.",
      });

      navigate("/finder/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to create account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-finder-red text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Handshake className="w-6 h-6" />
            <span className="text-xl font-bold">FinderMeister</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="#" className="hover:underline">How it Works</Link>
            <Link href="/login" className="hover:underline">Log In</Link>
            <span className="bg-white text-finder-red px-3 py-1 rounded font-medium">Sign Up</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto py-12 px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Sign Up as a Finder</h1>
          <p className="text-gray-600">Create an account to find products and services for clients.</p>
        </div>

        {/* User Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-finder-red/100 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="sr-only">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="h-12 border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="sr-only">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="h-12 border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="h-12 border-gray-300 rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="password" className="sr-only">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="h-12 border-gray-300 rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="sr-only">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="h-12 border-gray-300 rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="sr-only">Phone number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="h-12 border-gray-300 rounded-md"
                />
              </div>

              {/* Bio Input */}
              <div>
                <Label htmlFor="bio" className="sr-only">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Short bio (optional)"
                  className="h-12 border-gray-300 rounded-md"
                />
              </div>

              {/* Skills Input */}
              <div>
                <Label htmlFor="skills" className="sr-only">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="Skills (comma-separated)"
                  className="h-12 border-gray-300 rounded-md"
                />
              </div>

              {/* Categories Selection */}
              <div>
                <Label htmlFor="categories">Categories</Label>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Select all categories that match your skills and expertise:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border rounded-md bg-white/80">
                    {categoriesLoading ? (
                      <div className="col-span-full text-center py-4 text-gray-500">Loading categories...</div>
                    ) : categories.length > 0 ? (
                      categories
                        .filter(category => category.isActive)
                        .map((category) => (
                          <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.categories.includes(category.name)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  categories: isChecked
                                    ? [...prev.categories, category.name]
                                    : prev.categories.filter(cat => cat !== category.name)
                                }));
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          </label>
                        ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-gray-500">No categories available</div>
                    )}
                  </div>
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.categories.map((categoryName) => (
                        <Badge key={categoryName} variant="secondary" className="text-xs">
                          {categoryName}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                categories: prev.categories.filter(cat => cat !== categoryName)
                              }));
                            }}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Selection */}
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger className="bg-white/80 h-12">
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-3 mb-6">
                <input
                  type="checkbox"
                  id="acceptTermsFinder"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-finder-red focus:ring-finder-red"
                />
                <label htmlFor="acceptTermsFinder" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms-and-conditions" className="text-finder-red hover:underline font-medium">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !acceptedTerms || formData.categories.length === 0}
                className="w-full h-12 bg-finder-red hover:bg-finder-red-dark text-white font-medium text-lg rounded-md"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-finder-red hover:underline font-medium">
                  Log In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}