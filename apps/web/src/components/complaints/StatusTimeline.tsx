"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusEntry {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  reason: string | null;
  createdAt: string;
}

interface StatusTimelineProps {
  history: StatusEntry[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-400",
  ANALYZING: "bg-purple-500",
  AWAITING_USER_CONFIRMATION: "bg-yellow-500",
  READY_TO_SUBMIT: "bg-blue-400",
  SUBMITTED: "bg-blue-500",
  RECEIVED: "bg-blue-500",
  UNDER_REVIEW: "bg-yellow-500",
  ASSIGNED: "bg-indigo-500",
  IN_PROGRESS: "bg-blue-600",
  NEEDS_INFORMATION: "bg-orange-500",
  RESOLVED: "bg-green-500",
  CLOSED: "bg-green-600",
  REJECTED: "bg-red-500",
  DUPLICATE: "bg-gray-500",
  FAILED_SUBMISSION: "bg-red-600",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  ANALYZING: "Analyzing",
  AWAITING_USER_CONFIRMATION: "Awaiting Confirmation",
  READY_TO_SUBMIT: "Ready to Submit",
  SUBMITTED: "Submitted",
  RECEIVED: "Received",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  NEEDS_INFORMATION: "Needs Information",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
  FAILED_SUBMISSION: "Failed",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-gray-500">No status history available.</p>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, index) => {
          const isLast = index === history.length - 1;
          const dotColor = statusColors[entry.newStatus] || "bg-gray-400";
          const label = statusLabels[entry.newStatus] || entry.newStatus;

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-3 top-6 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-white",
                        dotColor
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {label}
                      </p>
                      <time className="text-xs text-gray-500">
                        {formatDate(entry.createdAt)}
                      </time>
                    </div>
                    {entry.reason && (
                      <p className="mt-0.5 text-sm text-gray-600">
                        {entry.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
