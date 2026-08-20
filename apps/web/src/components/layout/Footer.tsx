import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">About</h3>
            <p className="mt-3 text-sm text-gray-600">
              CivicConnect India empowers citizens to report civic issues and
              track their resolution in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/report" className="text-sm text-gray-600 hover:text-blue-600">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-sm text-gray-600 hover:text-blue-600">
                  Track Complaint
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-gray-600 hover:text-blue-600">
                  Issue Map
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="text-sm text-gray-600 hover:text-blue-600">
                  My Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-gray-600">support@civicconnect.in</li>
              <li className="text-sm text-gray-600">1800-XXX-XXXX (Toll Free)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CivicConnect India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
