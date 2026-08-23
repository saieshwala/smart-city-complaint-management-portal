import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p>
                When you use CivicConnect India, we collect information you provide directly,
                including your name, email address, phone number, and complaint details. We also
                collect location data (GPS coordinates) and images you upload when reporting issues.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Process and route your civic complaints to the appropriate government authorities</li>
                <li>Provide status updates on your complaints</li>
                <li>Improve our AI-powered issue classification system</li>
                <li>Communicate with you about your complaints</li>
                <li>Generate anonymized analytics to identify civic issue trends</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Sharing</h2>
              <p>
                We share your complaint information with relevant government authorities and
                municipal bodies for resolution. Public complaint data (without personal
                identifiers) may be displayed on our public map view.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. All data
                transmission is encrypted using SSL/TLS protocols.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data. You may also
                request that your complaints be made private (not shown on the public map). Contact
                us at support@civicconnect.in for any data-related requests.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Contact</h2>
              <p>
                For privacy-related inquiries, contact our Data Protection Officer at
                privacy@civicconnect.in.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
