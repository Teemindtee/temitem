
import { Link } from "wouter";
import { ArrowLeft, Users, Target, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center text-finder-red hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-finder-red to-red-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About FinderMeister</h1>
          <p className="text-xl md:text-2xl font-light max-w-4xl mx-auto leading-relaxed">
            At FinderMeister, we believe that every find request matters and every solution begins with a successful find.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="mb-16">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We are building the world's first human-powered search platform, designed to connect people who are looking for a product or service with finders — a trusted network of individuals ready to source what's needed.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                FinderMeister isn't just about locating what's missing — it's about creating trust, building connections, and empowering communities to help one another.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Motto, Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Motto */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-finder-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-finder-red" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Motto</h3>
              <p className="text-lg text-finder-red font-semibold italic">
                "One successful find at a time."
              </p>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mission Statement</h3>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to empower people to find what they need through a trusted network of human searchers — delivering solutions, one successful find at a time.
              </p>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vision Statement</h3>
              <p className="text-gray-700 leading-relaxed">
                We aim to become the world's most reliable human-powered search platform — where every find request matters, and every solution begins with one successful find.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <Card className="bg-gradient-to-r from-gray-50 to-white shadow-lg border-0 mb-16">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <Users className="w-12 h-12 text-finder-red mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Creating Trust</h4>
                <p className="text-gray-600">Building reliable connections between people who need something and those who can find it.</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Building Connections</h4>
                <p className="text-gray-600">Fostering meaningful relationships within our community of finders and seekers.</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Empowering Communities</h4>
                <p className="text-gray-600">Enabling people to help one another and create value through collaborative searching.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-finder-red text-white shadow-lg border-0">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Finding?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join our community of finders and clients today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-finder-red hover:bg-gray-100 font-semibold px-8">
                    Become a Client
                  </Button>
                </Link>
                <Link href="/auth/register-finder">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-finder-red font-semibold px-8">
                    Become a Finder
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
