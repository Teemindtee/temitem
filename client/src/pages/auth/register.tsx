import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Handshake, User, Search } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'finder'>('client');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Check URL params for role type
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'client' || type === 'finder') {
      setSelectedRole(type);
    }
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    if (user.role === 'client') {
      setLocation('/client/dashboard');
    } else if (user.role === 'finder') {
      setLocation('/finder/dashboard');
    } else if (user.role === 'admin') {
      setLocation('/admin/dashboard');
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        ...(selectedRole === 'finder' && formData.phone && { phone: formData.phone }),
      };

      await register(registrationData);
      toast({
        title: "Registration successful",
        description: "Welcome to FinderMeister!",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-finder-gray flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Handshake className="w-8 h-8 text-finder-red" />
            <span className="text-2xl font-bold text-finder-text">FinderMeister</span>
          </div>
          <CardTitle className="text-2xl font-bold text-finder-text">
            Join FinderMeister
          </CardTitle>
          <p className="text-finder-text-light">
            Create your account to get started
          </p>
        </CardHeader>
        <CardContent>
          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-base font-medium mb-3 block">I want to:</Label>
            <RadioGroup
              value={selectedRole}
              onValueChange={(value: 'client' | 'finder') => setSelectedRole(value)}
              className="grid grid-cols-1 gap-4"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="client" id="client" />
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <Label htmlFor="client" className="font-medium cursor-pointer">
                      Find something I need
                    </Label>
                    <p className="text-sm text-finder-text-light">Post requests for items or services</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="finder" id="finder" />
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <Label htmlFor="finder" className="font-medium cursor-pointer">
                      Help others find things
                    </Label>
                    <p className="text-sm text-finder-text-light">Browse requests and earn money</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="focus:ring-finder-red focus:border-finder-red"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="focus:ring-finder-red focus:border-finder-red"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="focus:ring-finder-red focus:border-finder-red"
              />
            </div>

            {selectedRole === 'finder' && (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="focus:ring-finder-red focus:border-finder-red"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="focus:ring-finder-red focus:border-finder-red"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="focus:ring-finder-red focus:border-finder-red"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-finder-red hover:bg-finder-red-dark"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : `Sign Up as ${selectedRole === 'client' ? 'Client' : 'Finder'}`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-finder-text-light">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-finder-red font-medium hover:underline">
                  Sign in
                </a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
