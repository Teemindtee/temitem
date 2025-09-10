import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AuthHeader } from "@/components/AuthHeader";
import { User, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Get user type from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'client' || type === 'finder') {
      setUserType(type);
      setFormData(prev => ({ ...prev, role: type }));
    }
  }, []);

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

    if (!formData.role) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select your role",
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

    setIsLoading(true);

    try {
      await register(formData);
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  // If we have a specific user type from URL, show specialized form
  if (userType === 'finder') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader currentPage="register" />

        <section className="py-8 sm:py-16">
          <div className="max-w-md mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up as a Finder</h1>
                <p className="text-gray-600 mb-6">
                  Create an account to find products and services for clients.
                </p>
                <div className="bg-finder-red rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                  <div>
                    <Input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>

                <Input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="bg-gray-50 border-gray-300"
                />

                <Input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="bg-gray-50 border-gray-300"
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="bg-gray-50 border-gray-300"
                />

                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="bg-gray-50 border-gray-300"
                />

                <div className="flex items-start space-x-3 mb-4">
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
                  className="w-full bg-finder-red hover:bg-finder-red-dark text-white py-3 font-medium"
                  disabled={isLoading || !acceptedTerms}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>

                <p className="text-center text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-finder-red hover:underline font-medium">
                    Log In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // General registration page with role selection
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader currentPage="register" />

      <section className="py-8 sm:py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600 mb-6">
                Join FinderMeister and start connecting with opportunities.
              </p>
              <div className="bg-finder-red rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="role" className="text-gray-700 font-medium">I am a</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client - I need help finding things</SelectItem>
                    <SelectItem value="finder">Finder - I can help find things</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div>
                  <Input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>

              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="bg-gray-50 border-gray-300"
              />

              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="bg-gray-50 border-gray-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="bg-gray-50 border-gray-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-start space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-finder-red focus:ring-finder-red"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms-and-conditions" className="text-finder-red hover:underline font-medium">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-finder-red hover:bg-finder-red-dark text-white py-3 font-medium"
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-finder-red hover:underline font-medium">
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}