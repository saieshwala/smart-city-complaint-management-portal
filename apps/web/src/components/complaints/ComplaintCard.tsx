"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

interface ComplaintCardProps {
  complaint: {
    id: string;
    publicId: string;
    title: string;
    status: string;
    priority: string;
    category?: { name: string; icon?: string } | null;
    address?: string | null;
    createdAt: string;
  };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  return (
    <Link href={`/complaints/${complaint.id}`}>
      <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-500 mb-1">
              {complaint.publicId}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
              {complaint.title}
            </h3>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {complaint.category && (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
              {complaint.category.name}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {timeAgo(complaint.createdAt)}
          </span>
          {complaint.address && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{complaint.address}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
