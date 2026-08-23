"use client";

import React from "react";
import Link from "next/link";

const footerLinks = {
  Platform: [
    { href: "/report", label: "Report Issue" },
    { href: "/track", label: "Track Complaint" },
    { href: "/map", label: "Issue Map" },
    { href: "/complaints", label: "My Complaints" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold text-sm">
                CC
              </div>
              <span className="text-lg font-bold text-white">
                Civic<span className="text-blue-400">Connect</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-500 max-w-xs">
              Empowering Indian citizens to report civic issues and track their resolution with AI-powered technology.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
              <div className="h-1.5 w-6 rounded-full bg-gradient-to-r from-orange-500 via-white to-green-500" />
              <span>Digital India Initiative</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-400 transition-colors animated-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-gray-500">support@civicconnect.in</li>
              <li className="text-sm text-gray-500">1800-XXX-XXXX (Toll Free)</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} CivicConnect India. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Built with purpose for a better India
          </p>
        </div>
      </div>
    </footer>
  );
}
