import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
            <p className="mb-4">
              FinderMeister Innovations ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. This policy is legally binding under the laws of the Federal Republic of Nigeria and complies with the Nigeria Data Protection Regulation (NDPR).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
            <p className="mb-4">When you register and use our services, we may collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name (first and last name)</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Payment details and transaction information</li>
              <li>Account activity and usage patterns</li>
              <li>Communication records and messages</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Verification Documents</h3>
            <p className="mb-4">For verification and compliance purposes, we may collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Voter's Card</li>
              <li>Driver's License</li>
              <li>International Passport</li>
              <li>National Identification Number (NIN)</li>
              <li>Bank Verification Number (BVN) for payment processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system information</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage data and platform interactions</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Management:</strong> Creating and maintaining your account, processing registrations</li>
              <li><strong>Service Delivery:</strong> Facilitating connections between Clients and Finders</li>
              <li><strong>Payment Processing:</strong> Managing escrow transactions, token purchases, and withdrawals</li>
              <li><strong>Security and Fraud Prevention:</strong> Protecting against unauthorized access and fraudulent activities</li>
              <li><strong>Dispute Resolution:</strong> Investigating and resolving conflicts between users</li>
              <li><strong>Compliance:</strong> Meeting legal and regulatory requirements</li>
              <li><strong>Communication:</strong> Sending important updates, notifications, and marketing materials</li>
              <li><strong>Platform Improvement:</strong> Analyzing usage patterns to enhance user experience</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="mb-4">We implement robust security measures to protect your information:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Encryption:</strong> All sensitive data is encrypted both in transit and at rest</li>
              <li><strong>Access Control:</strong> Restricted staff access on a need-to-know basis</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
              <li><strong>Secure Infrastructure:</strong> Industry-standard hosting and database security</li>
              <li><strong>Employee Training:</strong> Regular privacy and security training for all staff members</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information Sharing</h2>
            <p className="mb-4">We do not sell your personal information. We may share your data only in the following circumstances:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Licensed Payment Partners</h3>
            <p className="mb-4">
              We share necessary payment information with our licensed payment processors (Flutterwave, Opay, Paystack) to facilitate secure transactions and comply with financial regulations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Legal Requirements</h3>
            <p className="mb-4">We may disclose information when required by:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Nigerian law enforcement agencies</li>
              <li>Court orders or legal processes</li>
              <li>Regulatory authorities (CBN, NDPR, etc.)</li>
              <li>Protection of our rights and property</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Service Providers</h3>
            <p className="mb-4">
              We may share data with trusted third-party service providers who assist in platform operations, subject to strict confidentiality agreements.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights Under NDPR</h2>
            <p className="mb-4">As a Nigerian resident or user of our services, you have the following rights:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate information</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
              <li><strong>Right to Restriction:</strong> Request limitation of data processing</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw previously given consent</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
            <p className="mb-4">We retain your information for different periods depending on the type of data:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Information:</strong> Until account deletion plus 7 years for legal compliance</li>
              <li><strong>Transaction Records:</strong> 10 years as required by Nigerian financial regulations</li>
              <li><strong>Communication Logs:</strong> 2 years for dispute resolution purposes</li>
              <li><strong>Marketing Data:</strong> Until you opt out or withdraw consent</li>
              <li><strong>Legal Documents:</strong> As required by applicable laws</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cookies and Tracking</h2>
            <p className="mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized experiences</li>
              <li>Enhance security measures</li>
            </ul>
            <p className="mb-4">
              You can control cookie settings through your browser, but disabling certain cookies may affect platform functionality.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">International Transfers</h2>
            <p className="mb-4">
              While we primarily operate within Nigeria, some data may be transferred to other countries for cloud storage or processing. When this occurs, we ensure adequate protection through:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Data transfer agreements with international standards</li>
              <li>Compliance with NDPR cross-border transfer requirements</li>
              <li>Use of reputable international service providers with strong privacy protections</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
            <p className="mb-4">
              Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided personal information, we will delete it immediately.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify users of significant changes through email or platform notifications. Continued use of our services after policy updates constitutes acceptance of the revised terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p className="mb-4">For privacy-related questions, requests, or concerns, please contact us:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Email:</strong> privacy@findermeister.com</li>
              <li><strong>Phone:</strong> +2347039391065</li>
              <li><strong>Address:</strong> FinderMeister Innovations, Lagos, Nigeria</li>
              <li><strong>Data Protection Officer:</strong> dpo@findermeister.com</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Governing Law</h2>
            <p className="mb-4">
              This Privacy Policy is governed by the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Regulation (NDPR) and other applicable privacy and data protection laws.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link href="/">
              <Button className="bg-finder-red hover:bg-finder-red-dark text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}