"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

// --- Types ---

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byStatus: Record<string, number>;
}

interface RecentComplaint {
  id: string;
  publicId: string;
  title: string;
  category: string;
  priority: string;
  location: string;
  status: string;
  createdAt: string;
}

// --- Helpers ---

const priorityColors: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-100 text-red-700",
};

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          apiClient.get("/admin/stats"),
          apiClient.get("/admin/complaints", { params: { limit: 5 } }),
        ]);

        // Parse stats
        const statsData = statsRes.data?.data || statsRes.data || {};
        setStats({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          inProgress: statsData.inProgress || 0,
          resolved: statsData.resolved || 0,
          closed: statsData.closed || 0,
          byStatus: statsData.byStatus || {},
        });

        // Parse recent complaints
        const complaintsData = complaintsRes.data;
        const items = Array.isArray(complaintsData)
          ? complaintsData
          : complaintsData?.items || complaintsData?.data || [];
        setRecentComplaints(
          items.map((c: any) => ({
            id: c.id,
            publicId: c.publicId,
            title: c.title,
            category: c.category?.name || "Other",
            priority: c.priority || "MEDIUM",
            location: c.address
              ? c.address.split(",").slice(0, 2).join(", ")
              : "Unknown",
            status: c.status,
            createdAt: c.createdAt,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Complaints",
      value: stats?.total ?? 0,
      icon: FileText,
      iconColor: "text-primary-600",
      iconBg: "bg-primary-50",
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      icon: PlusCircle,
      iconColor: "text-saffron-600",
      iconBg: "bg-orange-50",
    },
    {
      title: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      title: "Resolved",
      value: stats?.resolved ?? 0,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "Closed",
      value: stats?.closed ?? 0,
      icon: AlertTriangle,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-50",
    },
    {
      title: "Draft",
      value: stats?.byStatus?.["DRAFT"] ?? 0,
      icon: Flame,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of complaint management system
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live data
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  card.iconBg
                )}
              >
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">
            Recent Complaints
          </h3>
          <Link
            href="/dashboard/complaints"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All Complaints <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No complaints yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Complaints submitted from the citizen portal will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    ID
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Priority
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Location
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/dashboard/complaints/${complaint.id}`)
                    }
                  >
                    <td className="px-5 py-3">
                      <span className="text-sm font-mono font-medium text-primary-600">
                        {complaint.publicId}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-700">
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          priorityColors[complaint.priority] ||
                            "bg-slate-100 text-slate-700"
                        )}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {complaint.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          statusColors[complaint.status] ||
                            "bg-slate-100 text-slate-700"
                        )}
                      >
                        {formatStatus(complaint.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-500">
                        {formatDate(complaint.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {recentComplaints.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <p className="text-xs text-slate-500">
              Showing {recentComplaints.length} of {stats?.total ?? 0} complaints
            </p>
            <Link
              href="/dashboard/complaints"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
