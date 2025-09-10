
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Terms of Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Introduction</h3>
            <p className="mb-4">
              Welcome to FinderMeister Innovations. By registering as a Client (who posts finds) or a Finder (who applies to complete finds), you agree to abide by these Terms of Use, our Privacy Policy, and Refund Policy. These Terms are legally binding under the laws of the Federal Republic of Nigeria.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Nature of Services</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>FinderMeister is an online marketplace platform. We do not directly supply goods or services.</li>
              <li>Our role is to connect Clients and Finders and facilitate secure transactions using escrow via licensed payment processors (e.g., Flutterwave, Opay).</li>
              <li>FinderMeister does not issue wallets or hold customer funds.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">FinderTokens</h3>
            <p className="mb-4">
              FinderTokens are access credits used to apply for finds by Finders or boost a find by Clients. They are not currency, not legal tender, and hold no monetary value outside the platform.
            </p>
            <p className="mb-4">FinderTokens are:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Non-refundable</li>
              <li>Non-transferable</li>
              <li>Expire after six (6) months from issuance</li>
              <li>20 FinderTokens are awarded to each finder monthly</li>
            </ul>
            <p className="mb-4 font-medium">
              The expiry and non-refundable nature of FinderTokens are final and binding.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contracts & Escrow</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>All contracts are fixed budget that can be agreed on between Finders and Clients.</li>
              <li>Clients must deposit funds into escrow before a Finder begins work.</li>
            </ul>
            <p className="mb-4">Escrow funds are released:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Automatically if no dispute is raised within the inspection period (48 hours).</li>
              <li>Upon Client approval of deliverables.</li>
              <li>Following dispute resolution (see Section 4).</li>
            </ul>
            <p className="mb-4 font-medium">
              Finality Clause: Once escrow is released, payment is irreversible except in proven fraud.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">User Obligations</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>No exchange of phone numbers, email addresses and other contact details before a contract starts</li>
              <li>No illegal or prohibited finds (e.g., drugs, contraband, fraud, prostitution or trafficking)</li>
              <li>No bypassing escrow.</li>
              <li>No fraudulent evidence.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Account Suspension</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>FinderMeister operates a strike system. 3 strikes = suspension.</li>
              <li>Severe breaches may result in immediate account termination.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Limitation of Liability</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>FinderMeister is not liable for indirect or consequential damages.</li>
              <li>Our maximum liability = service fee earned on the disputed contract.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Indemnity</h3>
            <p className="mb-4">
              Users indemnify FinderMeister against losses, damages, or claims arising from their activities on the platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Refund Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Eligible Refunds:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Non-completion of Find(s)</li>
              <li>Breach of contract proven through disputes.</li>
              <li>Unsatisfactory delivery where both parties agree.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Non-Refundable Items</h3>
            <p className="mb-4">
              FinderTokens are strictly non-refundable, non-transferable, and expire after 6 months.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Processing Time</h3>
            <p className="mb-4">
              Refunds processed in 7–14 working days through Flutterwave/Opay.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Privacy Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Data We Collect</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email, phone, payment details, account activity.</li>
              <li>Verification documents: Voter's Card, Driver's License, International Passport, NIN.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Purpose</h3>
            <p className="mb-4">
              Account management, escrow, fraud prevention, dispute resolution, compliance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Data Security</h3>
            <p className="mb-4">
              Encrypted storage, restricted staff access.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Third Parties</h3>
            <p className="mb-4">
              Data may be shared only with licensed partners (e.g., Flutterwave, Opay).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">User Rights</h3>
            <p className="mb-4">
              Request access, correction, or deletion of data in line with NDPR.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Dispute Resolution Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Scope</h3>
            <p className="mb-4">Covers disputes relating to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Non-delivery, late delivery, quality issues, fraud, refund eligibility.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Principles</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Funds in escrow remain until Client confirms delivery or a dispute decision is reached.</li>
              <li>Admissible evidence during dispute resolution includes in-platform communications and other notable communication channels.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Timelines</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Dispute must be raised within 72 hours of completion of a find.</li>
              <li>Evidence submission: 72 hours per party.</li>
              <li>Mediation resolution: within 72 hours after evidence submission.</li>
              <li>Auto-release if no dispute is raised in inspection window.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Evidence Standards</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Goods: unboxing videos/photos, courier tracking etc</li>
              <li>Real Estate: inspection photos/videos, listings, agent communications etc</li>
              <li>Services/Healthcare: logs, before/after evidence, correspondence. etc</li>
              <li>Digital Items: access logs, versioned files etc.</li>
              <li>Manipulated evidence = penalties.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Resolution Tiers</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Tier 1 – Mediation: Support reviews and proposes outcome.</li>
              <li>Tier 2 – Dispute Panel: Final internal decision.</li>
              <li>Appeals allowed once with new material evidence.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Possible Outcomes</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Full release to Finder.</li>
              <li>Full refund to Client.</li>
              <li>Partial split/refund.</li>
              <li>Redo/repair with new deadline.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Fees & Chargebacks</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Payment processor fees may not be refundable.</li>
              <li>FinderTokens are not refundable.</li>
              <li>Excessive chargebacks = account suspension.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Unresponsive Party</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>If Client unresponsive = funds released to Finder.</li>
              <li>If Finder unresponsive = refund to Client.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Prohibited Activity</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Illegal finds = cancellation, refund to Client, and ban.</li>
              <li>Fraudulent evidence = penalties and account termination.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Governing Law</h3>
            <p className="mb-4">
              Nigerian law governs all disputes.
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
