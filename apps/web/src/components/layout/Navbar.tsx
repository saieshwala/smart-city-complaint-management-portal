"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report Issue" },
  { href: "/track", label: "Track" },
  { href: "/map", label: "Map" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || !isHome
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold text-sm shadow-md group-hover:shadow-blue-500/25 transition-shadow">
              CC
            </div>
            <span className={cn(
              "text-lg font-bold transition-colors",
              scrolled || !isHome ? "text-gray-900" : "text-white"
            )}>
              Civic<span className="text-blue-500">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 animated-underline",
                  pathname === link.href
                    ? scrolled || !isHome
                      ? "text-blue-600"
                      : "text-white"
                    : scrolled || !isHome
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-white/70 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    scrolled || !isHome
                      ? "text-gray-700 hover:bg-gray-50"
                      : "text-white/90 hover:bg-white/10"
                  )}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span>{user?.name || "User"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200/50 bg-white/95 backdrop-blur-xl py-1 shadow-xl z-50">
                      <Link
                        href="/complaints"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        My Complaints
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    scrolled || !isHome
                      ? "text-gray-700 hover:bg-gray-50"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              "md:hidden rounded-lg p-2 transition-colors",
              scrolled || !isHome
                ? "text-gray-600 hover:bg-gray-50"
                : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-xl border-t border-gray-100",
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 border-transparent"
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/complaints"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  My Complaints
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  className="flex-1 text-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center btn-gradient rounded-lg px-3 py-2.5 text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
