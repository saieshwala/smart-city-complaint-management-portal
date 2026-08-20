"use client";

import { cn } from "@/lib/utils";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const priorityConfig: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  LOW: {
    label: "Low",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  MEDIUM: {
    label: "Medium",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  HIGH: {
    label: "High",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  CRITICAL: {
    label: "Critical",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PriorityBadge({
  priority,
  size = "sm",
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.LOW;

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
        config.border,
        sizeClasses[size],
        priority === "CRITICAL" && "animate-pulse",
        className
      )}
    >
      {priority === "CRITICAL" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
      )}
      {priority === "HIGH" && (
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
      )}
      {config.label}
    </span>
  );
}

export type { Priority };
