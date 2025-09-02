import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/findermeister logo real_1756395091374.jpg";

export default function MobileLanding() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Layout */}
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl relative">
        {/* Header with Logo */}
        <div className="bg-finder-red px-6 py-4 flex items-center rounded-t-3xl">
          <img 
            src={logoImage} 
            alt="FinderMeister Logo" 
            className="w-10 h-10 rounded-full object-contain bg-white p-1 mr-3" 
          />
          <h1 className="text-2xl font-bold text-white">FinderMeister</h1>
        </div>

        {/* Main Content */}
        <div className="px-6 py-12 flex flex-col justify-center min-h-[calc(100vh-80px)]">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              Trouble Finding<br />
              a Product or<br />
              Service?
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Connect with finders who can help you search for what you need.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            {user ? (
              <Link href={user.role === 'client' ? '/client/dashboard' : user.role === 'finder' ? '/finder/dashboard' : '/admin/dashboard'}>
                <Button className="w-full bg-finder-red hover:bg-finder-red-dark text-white py-4 text-lg font-semibold rounded-xl shadow-lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button className="w-full bg-finder-red hover:bg-finder-red-dark text-white py-4 text-lg font-semibold rounded-xl shadow-lg">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Bottom Tagline */}
          <div className="text-center mt-auto">
            <p className="text-gray-500 text-base font-medium">
              One successful find<br />
              at a time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}