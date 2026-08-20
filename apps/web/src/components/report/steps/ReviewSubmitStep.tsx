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
} from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { AiAnalysisResult } from "./AiAnalysisStep";

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

function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `CIV-${year}-${randomDigits}`;
}

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [complaintId] = useState(generateComplaintId);

  const previews = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );

  const department = departmentMapping[category] || "General Administration";

  const handleSubmit = async () => {
    onSubmit();
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitted(true);
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
            onClick={() => (window.location.href = "/dashboard")}
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

      {/* Submit button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 min-h-[52px] text-base"
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
        {isSubmitting ? "Submitting..." : "Submit Complaint"}
      </Button>
    </motion.div>
  );
}
