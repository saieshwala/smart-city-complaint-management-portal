"use client";

import React from "react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  ANALYZING: { label: "Analyzing", className: "bg-purple-100 text-purple-700" },
  AWAITING_USER_CONFIRMATION: { label: "Awaiting Confirmation", className: "bg-yellow-100 text-yellow-700" },
  READY_TO_SUBMIT: { label: "Ready to Submit", className: "bg-blue-100 text-blue-700" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  RECEIVED: { label: "Received", className: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-yellow-100 text-yellow-700" },
  ASSIGNED: { label: "Assigned", className: "bg-indigo-100 text-indigo-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  NEEDS_INFORMATION: { label: "Needs Info", className: "bg-orange-100 text-orange-700" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
  DUPLICATE: { label: "Duplicate", className: "bg-gray-100 text-gray-700" },
  FAILED_SUBMISSION: { label: "Failed", className: "bg-red-100 text-red-700" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
