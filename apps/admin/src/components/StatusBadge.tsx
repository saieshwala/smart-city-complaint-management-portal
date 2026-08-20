"use client";

import { cn } from "@/lib/utils";

type ComplaintStatus =
  | "SUBMITTED"
  | "ACCEPTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "INFO_REQUESTED"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "DUPLICATE"
  | "ESCALATED";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  ASSIGNED: {
    label: "Assigned",
    bg: "bg-violet-50 border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  ON_HOLD: {
    label: "On Hold",
    bg: "bg-slate-50 border-slate-300",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  INFO_REQUESTED: {
    label: "Info Requested",
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    bg: "bg-gray-50 border-gray-300",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  DUPLICATE: {
    label: "Duplicate",
    bg: "bg-stone-50 border-stone-300",
    text: "text-stone-600",
    dot: "bg-stone-400",
  },
  ESCALATED: {
    label: "Escalated",
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  size = "sm",
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.SUBMITTED;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            config.dot,
            size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5"
          )}
        />
      )}
      {config.label}
    </span>
  );
}

export type { ComplaintStatus };
