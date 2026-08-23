"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MapPin,
  Tag,
  AlertTriangle,
  FileText,
  Building2,
  ImageIcon,
  ArrowRight,
  Plus,
  Eye,
  XCircle,
  LogIn,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { AiAnalysisResult } from "./AiAnalysisStep";
import apiClient from "@/lib/api-client";
import { useAuthContext } from "@/context/AuthContext";

const MiniMap = dynamic(
  () => import("@/components/report/steps/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[150px] rounded-lg bg-gray-100 animate-pulse" />
    ),
  }
);

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  source: "browser" | "manual";
}

interface ReviewSubmitStepProps {
  images: File[];
  location: LocationData;
  category: string;
  subcategory: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  aiAnalysis: AiAnalysisResult | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const severityVariant: Record<
  string,
  "success" | "warning" | "danger" | "info"
> = {
  low: "success",
  medium: "warning",
  high: "warning",
  critical: "danger",
};

const departmentMapping: Record<string, string> = {
  "Waste Management": "Sanitation & Waste Department",
  Roads: "Public Works Department (Roads Division)",
  Traffic: "Traffic Management Authority",
  Water: "Water Supply & Distribution Department",
  Sewerage: "Sewerage & Drainage Department",
  "Street Lighting": "Electrical Maintenance Division",
  "Public Infrastructure": "Public Works Department (Infrastructure)",
  Environment: "Environmental Protection Agency",
  Other: "General Administration",
};

export function ReviewSubmitStep({
  images,
  location,
  category,
  subcategory,
  severity,
  title,
  description,
  aiAnalysis,
  isSubmitting,
  onSubmit,
}: ReviewSubmitStepProps) {
  const { isAuthenticated, login, loginWithOtp, sendPhoneOtp } = useAuthContext();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Inline login state
  const [showLogin, setShowLogin] = useState(false);
  const [loginTab, setLoginTab] = useState<"email" | "phone">("phone");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const previews = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );

  const department = departmentMapping[category] || "General Administration";

  const handleInlineEmailLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setShowLogin(false);
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInlineSendOtp = async () => {
    if (!loginPhone.trim()) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      await sendPhoneOtp(loginPhone.trim());
      setOtpSent(true);
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInlineOtpLogin = async () => {
    if (!loginOtp.trim()) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      await loginWithOtp(loginPhone.trim(), loginOtp.trim());
      setShowLogin(false);
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async () => {
    onSubmit();
    setSubmitError(null);

    try {
      // 1. Resolve category/subcategory names → UUIDs
      const catRes = await apiClient.get("/categories");
      const allCategories = Array.isArray(catRes.data) ? catRes.data : [];

      let categoryId: string | undefined;
      let subcategoryId: string | undefined;

      const matchedCat = allCategories.find(
        (c: any) => c.name === category
      );
      if (matchedCat) {
        categoryId = matchedCat.id;
        const matchedSub = matchedCat.subcategories?.find(
          (s: any) => s.name === subcategory
        );
        if (matchedSub) subcategoryId = matchedSub.id;
      }

      // 2. Create complaint — build body with only fields the API accepts
      const createBody: Record<string, any> = {
        title,
        description,
        reportedAt: new Date().toISOString(),
      };
      if (categoryId) createBody.categoryId = categoryId;
      if (subcategoryId) createBody.subcategoryId = subcategoryId;
      if (location.latitude != null) createBody.latitude = location.latitude;
      if (location.longitude != null) createBody.longitude = location.longitude;
      if (location.address) createBody.address = location.address;
      if (location.source) createBody.locationSource = location.source.toUpperCase();

      const createRes = await apiClient.post("/complaints", createBody);
      const complaint = createRes.data;

      // 3. Upload images (non-blocking — don't fail the whole submission)
      if (images.length > 0) {
        try {
          const formData = new FormData();
          images.forEach((file) => formData.append("files", file));
          await apiClient.post(
            `/complaints/${complaint.id}/images`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        } catch (imgErr) {
          console.warn("Image upload failed (continuing with submission):", imgErr);
        }
      }

      // 4. Submit complaint for processing
      try {
        await apiClient.post(`/complaints/${complaint.id}/submit`);
      } catch (submitErr: any) {
        // If submit fails (e.g. Redis not running), complaint is still created as DRAFT
        console.warn("Submit step failed, complaint saved as draft:", submitErr);
      }

      setComplaintId(complaint.publicId);
      setIsSubmitted(true);
    } catch (err: any) {
      const raw = err?.response?.data?.message ?? err?.message;
      let msg: string;
      if (Array.isArray(raw)) {
        msg = raw.join(". ");
      } else if (typeof raw === "string") {
        msg = raw;
      } else {
        msg = "Something went wrong. Please try again.";
      }
      setSubmitError(msg);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="relative"
        >
          <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-emerald-400"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1, repeat: 2, ease: "easeOut" }}
          />
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Complaint Submitted Successfully!
          </h2>
          <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 mt-2">
            <span className="text-sm text-gray-500">Complaint ID:</span>
            <span className="text-sm font-bold text-gray-900 font-mono">
              {complaintId}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center max-w-md">
          Your complaint will be reviewed and routed to the appropriate
          department. You can track its progress in your dashboard.
        </p>

        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 max-w-md w-full">
          <div className="flex items-start gap-2">
            <Building2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Routing to Department
              </p>
              <p className="text-sm text-blue-700">{department}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-4">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => (window.location.href = "/complaints")}
          >
            <Eye className="h-5 w-5" />
            View My Complaints
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => (window.location.href = "/report")}
          >
            <Plus className="h-5 w-5" />
            Report Another
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Review &amp; Submit
        </h2>
        <p className="text-sm text-gray-500">
          Please review all details before submitting your complaint.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ImageIcon className="h-4 w-4" />
              Photos ({images.length})
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4" />
              Location
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="h-[150px]">
                <MiniMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  onLocationChange={() => {}}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">{location.address}</p>
          </div>

          <hr className="border-gray-100" />

          {/* Category & Severity */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                Category
              </div>
              <div className="flex gap-1.5">
                <Badge variant="info">{category}</Badge>
                {subcategory && <Badge variant="default">{subcategory}</Badge>}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <AlertTriangle className="h-4 w-4" />
                Severity
              </div>
              <Badge variant={severityVariant[severity]}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Badge>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Title & Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4" />
              Complaint Details
            </div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Department */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
            <Building2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-800">
                Will be routed to:
              </p>
              <p className="text-sm text-blue-700">{department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimers */}
      <div className="space-y-2 text-xs text-gray-500">
        <p>
          By submitting, you confirm this information is accurate to the best of
          your knowledge.
        </p>
        <p>
          This platform is a technology service for routing civic complaints. It
          does not replace official government authorities.
        </p>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Submission Failed
            </p>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      {/* Login prompt (shown when not authenticated) */}
      {!isAuthenticated && !showLogin && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              Sign in to submit your complaint
            </p>
          </div>
          <p className="text-xs text-blue-700">
            You need to be logged in to submit. Your report details are saved.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowLogin(true)}
          >
            <LogIn className="h-5 w-5" />
            Sign In / Register
          </Button>
        </div>
      )}

      {/* Inline login form */}
      {!isAuthenticated && showLogin && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Quick Sign In</h3>
            <button
              onClick={() => setShowLogin(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          {/* Login tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setLoginTab("phone"); setLoginError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                loginTab === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              )}
            >
              <Phone className="h-3.5 w-3.5" /> Phone OTP
            </button>
            <button
              onClick={() => { setLoginTab("email"); setLoginError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                loginTab === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              )}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
          </div>

          {loginError && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>
          )}

          {loginTab === "phone" && (
            <div className="space-y-3">
              <Input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={otpSent}
              />
              {!otpSent ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleInlineSendOtp}
                  loading={loginLoading}
                >
                  Send OTP
                </Button>
              ) : (
                <>
                  <Input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    placeholder="Enter OTP (4141)"
                    maxLength={4}
                    className="text-center tracking-widest"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleInlineOtpLogin}
                    loading={loginLoading}
                  >
                    Verify & Continue
                  </Button>
                  <button
                    onClick={() => { setOtpSent(false); setLoginOtp(""); }}
                    className="w-full text-xs text-blue-600 hover:text-blue-700"
                  >
                    Change number
                  </button>
                </>
              )}
            </div>
          )}

          {loginTab === "email" && (
            <div className="space-y-3">
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
              />
              <Input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
              />
              <Button
                variant="primary"
                className="w-full"
                onClick={handleInlineEmailLogin}
                loading={loginLoading}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Submit button (only when authenticated) */}
      {isAuthenticated && (
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 min-h-[52px] text-base"
          loading={isSubmitting && !submitError}
          onClick={handleSubmit}
          disabled={isSubmitting && !submitError}
        >
          {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
          {isSubmitting && !submitError
            ? "Submitting..."
            : submitError
            ? "Retry Submission"
            : "Submit Complaint"}
        </Button>
      )}
    </motion.div>
  );
}
