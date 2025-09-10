
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center text-finder-red hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using FinderMeister ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              FinderMeister is a platform that connects clients who need products or services found with skilled finders who can locate and deliver these items.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To use our services, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and truthful information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect other users and maintain professional conduct</li>
              <li>Not engage in fraudulent or harmful activities</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Payment and Fees</h2>
            <p className="mb-4">
              FinderMeister operates on a token-based system. Platform fees apply to all transactions. Payments are processed securely through our payment partners.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Prohibited Activities</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Posting illegal, harmful, or inappropriate content</li>
              <li>Attempting to circumvent platform security measures</li>
              <li>Harassment or discrimination against other users</li>
              <li>Spamming or unsolicited communications</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
            <p className="mb-4">
              All content on the Platform, including logos, text, and software, is owned by FinderMeister or its licensors and is protected by intellectual property laws.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Privacy Policy</h2>
            <p className="mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Dispute Resolution</h2>
            <p className="mb-4">
              Any disputes arising from the use of this Platform will be resolved through our internal dispute resolution process or applicable legal procedures.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              FinderMeister shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend your account at any time for violations of these terms or other reasons at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
            <p className="mb-4">
              We may modify these terms at any time. Changes will be effective upon posting. Continued use of the Platform constitutes acceptance of modified terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms and Conditions, please contact us through our support system.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link href="/register">
              <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                Back to Registration
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
