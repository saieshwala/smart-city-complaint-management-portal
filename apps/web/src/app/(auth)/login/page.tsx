"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, Phone, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithOtp, sendPhoneOtp } = useAuthContext();
  const [tab, setTab] = useState<"email" | "phone">("email");

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/complaints");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setError("");
    setLoading(true);

    try {
      await sendPhoneOtp(phone.trim());
      setOtpSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setError("");
    setLoading(true);

    try {
      await loginWithOtp(phone.trim(), otp.trim());
      router.push("/complaints");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl glass-light p-8 shadow-2xl shadow-black/10">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold text-sm shadow-lg">
            CC
          </div>
        </Link>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your CivicConnect account</p>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => { setTab("email"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
            tab === "email"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          onClick={() => { setTab("phone"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
            tab === "phone"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone OTP
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Email + Password Form */}
      {tab === "email" && (
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full btn-gradient !bg-gradient-to-r !from-blue-600 !to-violet-600 group">
            Sign In
            {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </Button>
        </form>
      )}

      {/* Phone OTP Form */}
      {tab === "phone" && (
        <form onSubmit={handleOtpLogin} className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                disabled={otpSent}
                className="pl-10"
              />
            </div>
          </div>

          {!otpSent ? (
            <Button
              type="button"
              onClick={handleSendOtp}
              loading={loading}
              className="w-full btn-gradient !bg-gradient-to-r !from-blue-600 !to-violet-600 group"
            >
              Send OTP
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  required
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  OTP sent to {phone}.{" "}
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change number
                  </button>
                </p>
              </div>

              <Button type="submit" loading={loading} className="w-full btn-gradient !bg-gradient-to-r !from-blue-600 !to-violet-600 group">
                Verify & Sign In
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 animated-underline">
          Register
        </Link>
      </p>
    </div>
  );
}
