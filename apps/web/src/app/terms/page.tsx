import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using CivicConnect India, you agree to be bound by these Terms of
                Service. If you do not agree, please do not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Use of Service</h2>
              <p>CivicConnect India is a platform for reporting legitimate civic issues. You agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide accurate and truthful information in your complaints</li>
                <li>Upload only genuine photographs of civic issues</li>
                <li>Not submit false, misleading, or duplicate complaints</li>
                <li>Not use the platform for harassment or defamation</li>
                <li>Respect the privacy of other users and government officials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Account Responsibility</h2>
              <p>
                You are responsible for maintaining the security of your account credentials. Any
                activity under your account is your responsibility. Notify us immediately if you
                suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Content Rights</h2>
              <p>
                By uploading images and descriptions, you grant CivicConnect India a non-exclusive
                license to use this content for complaint processing, government communication, and
                platform improvement. You retain ownership of your original content.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Disclaimer</h2>
              <p>
                CivicConnect India acts as an intermediary between citizens and government
                authorities. We do not guarantee resolution timelines or outcomes. Resolution
                depends on the respective government authority.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use after changes
                constitutes acceptance of the updated terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
