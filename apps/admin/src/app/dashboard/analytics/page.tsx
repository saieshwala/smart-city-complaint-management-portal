"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Timer,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

// --- Types ---

interface AnalyticsOverview {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionTime: string;
  totalChange: string;
  resolvedChange: string;
  pendingChange: string;
  avgTimeChange: string;
}

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface TrendData {
  month: string;
  complaints: number;
  resolved: number;
}

interface TopArea {
  area: string;
  totalComplaints: number;
  resolved: number;
  pending: number;
  resolutionRate: string;
}

// --- Mock data ---

const mockOverview: AnalyticsOverview = {
  totalComplaints: 12847,
  resolvedComplaints: 8126,
  pendingComplaints: 4234,
  avgResolutionTime: "5.2 days",
  totalChange: "+12.5%",
  resolvedChange: "+18.7%",
  pendingChange: "-4.2%",
  avgTimeChange: "-22.4%",
};

const mockCategories: CategoryBreakdown[] = [
  { category: "Roads & Infrastructure", count: 2845, percentage: 22.1, color: "bg-blue-500" },
  { category: "Water Supply", count: 2340, percentage: 18.2, color: "bg-cyan-500" },
  { category: "Electricity", count: 1980, percentage: 15.4, color: "bg-amber-500" },
  { category: "Sanitation", count: 1750, percentage: 13.6, color: "bg-emerald-500" },
  { category: "Parks & Recreation", count: 1200, percentage: 9.3, color: "bg-green-500" },
  { category: "Public Transport", count: 1080, percentage: 8.4, color: "bg-violet-500" },
  { category: "Noise Pollution", count: 870, percentage: 6.8, color: "bg-orange-500" },
  { category: "Other", count: 782, percentage: 6.1, color: "bg-slate-400" },
];

const mockStatusDist: StatusDistribution[] = [
  { status: "Resolved", count: 8126, percentage: 63.2 },
  { status: "In Progress", count: 2421, percentage: 18.8 },
  { status: "Assigned", count: 1013, percentage: 7.9 },
  { status: "New", count: 800, percentage: 6.2 },
  { status: "Closed", count: 487, percentage: 3.8 },
];

const mockTrends: TrendData[] = [
  { month: "Jan", complaints: 980, resolved: 820 },
  { month: "Feb", complaints: 1050, resolved: 900 },
  { month: "Mar", complaints: 1120, resolved: 950 },
  { month: "Apr", complaints: 1280, resolved: 1100 },
  { month: "May", complaints: 1150, resolved: 1020 },
  { month: "Jun", complaints: 1340, resolved: 1180 },
  { month: "Jul", complaints: 1420, resolved: 1250 },
  { month: "Aug", complaints: 1380, resolved: 1300 },
  { month: "Sep", complaints: 1260, resolved: 1150 },
  { month: "Oct", complaints: 1490, resolved: 1280 },
  { month: "Nov", complaints: 1350, resolved: 1200 },
  { month: "Dec", complaints: 1024, resolved: 976 },
];

const mockTopAreas: TopArea[] = [
  { area: "MG Road, Bengaluru", totalComplaints: 487, resolved: 398, pending: 89, resolutionRate: "81.7%" },
  { area: "Connaught Place, Delhi", totalComplaints: 421, resolved: 352, pending: 69, resolutionRate: "83.6%" },
  { area: "Andheri, Mumbai", totalComplaints: 389, resolved: 290, pending: 99, resolutionRate: "74.6%" },
  { area: "T Nagar, Chennai", totalComplaints: 356, resolved: 301, pending: 55, resolutionRate: "84.6%" },
  { area: "Sector 15, Noida", totalComplaints: 312, resolved: 245, pending: 67, resolutionRate: "78.5%" },
  { area: "Salt Lake, Kolkata", totalComplaints: 298, resolved: 256, pending: 42, resolutionRate: "85.9%" },
  { area: "Banjara Hills, Hyderabad", totalComplaints: 276, resolved: 220, pending: 56, resolutionRate: "79.7%" },
  { area: "Aundh, Pune", totalComplaints: 254, resolved: 210, pending: 44, resolutionRate: "82.7%" },
];

const statusColors: Record<string, string> = {
  Resolved: "bg-emerald-500",
  "In Progress": "bg-amber-500",
  Assigned: "bg-indigo-500",
  New: "bg-blue-500",
  Closed: "bg-slate-400",
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview>(mockOverview);
  const [categories, setCategories] = useState<CategoryBreakdown[]>(mockCategories);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>(mockStatusDist);
  const [trends, setTrends] = useState<TrendData[]>(mockTrends);
  const [topAreas, setTopAreas] = useState<TopArea[]>(mockTopAreas);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("last_30_days");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, categoriesRes, statusRes, trendsRes, areasRes] =
        await Promise.allSettled([
          apiClient.get("/admin/analytics/overview", { params: { range: dateRange } }),
          apiClient.get("/admin/analytics/by-category", { params: { range: dateRange } }),
          apiClient.get("/admin/analytics/by-status", { params: { range: dateRange } }),
          apiClient.get("/admin/analytics/trend", { params: { range: dateRange } }),
          apiClient.get("/admin/analytics/top-areas", { params: { range: dateRange } }),
        ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.data) {
        const d = overviewRes.value.data;
        setOverview({
          totalComplaints: d.total ?? d.totalComplaints ?? 0,
          resolvedComplaints: d.resolved ?? d.resolvedComplaints ?? 0,
          pendingComplaints: d.pending ?? d.pendingComplaints ?? 0,
          avgResolutionTime: d.avgResolutionHours != null
            ? `${(d.avgResolutionHours / 24).toFixed(1)} days`
            : d.avgResolutionTime ?? "N/A",
          totalChange: d.totalChange ?? "+0%",
          resolvedChange: d.resolvedChange ?? "+0%",
          pendingChange: d.pendingChange ?? "+0%",
          avgTimeChange: d.avgTimeChange ?? "+0%",
        });
      }

      if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value.data)) {
        const colors = ["bg-blue-500", "bg-cyan-500", "bg-amber-500", "bg-emerald-500", "bg-green-500", "bg-violet-500", "bg-orange-500", "bg-slate-400"];
        const items = categoriesRes.value.data;
        const total = items.reduce((a: number, c: any) => a + (c.count || 0), 0);
        setCategories(
          items.map((c: any, i: number) => ({
            category: c.categoryName || c.category || "Unknown",
            count: c.count || 0,
            percentage: total > 0 ? Math.round((c.count / total) * 1000) / 10 : 0,
            color: colors[i % colors.length],
          }))
        );
      }

      if (statusRes.status === "fulfilled" && Array.isArray(statusRes.value.data)) {
        const items = statusRes.value.data;
        const total = items.reduce((a: number, c: any) => a + (c.count || 0), 0);
        const statusLabels: Record<string, string> = {
          SUBMITTED: "New",
          RECEIVED: "New",
          UNDER_REVIEW: "In Progress",
          ASSIGNED: "Assigned",
          IN_PROGRESS: "In Progress",
          RESOLVED: "Resolved",
          CLOSED: "Closed",
          REJECTED: "Closed",
        };
        setStatusDist(
          items.map((s: any) => ({
            status: statusLabels[s.status] || s.status,
            count: s.count || 0,
            percentage: total > 0 ? Math.round((s.count / total) * 1000) / 10 : 0,
          }))
        );
      }

      if (trendsRes.status === "fulfilled" && Array.isArray(trendsRes.value.data)) {
        setTrends(
          trendsRes.value.data.map((t: any) => ({
            month: t.date || t.month || "",
            complaints: t.count || t.complaints || 0,
            resolved: t.resolved || 0,
          }))
        );
      }

      if (areasRes.status === "fulfilled" && Array.isArray(areasRes.value.data)) {
        setTopAreas(
          areasRes.value.data.map((a: any) => ({
            area: [a.city, a.district, a.state].filter(Boolean).join(", ") || a.area || "Unknown",
            totalComplaints: a.count || a.totalComplaints || 0,
            resolved: a.resolved || 0,
            pending: a.pending || (a.count || 0) - (a.resolved || 0),
            resolutionRate: a.resolutionRate || (a.count > 0 ? `${Math.round((a.resolved || 0) / a.count * 100)}%` : "0%"),
          }))
        );
      }
    } catch {
      // Keep mock data on failure
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxTrend = Math.max(...trends.map((t) => Math.max(t.complaints, t.resolved)));

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Detailed insights into complaint management performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="last_year">Last Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
              <TrendingUp className="w-3 h-3" />
              {overview.totalChange}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-800">
              {overview.totalComplaints.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Total Complaints</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
              <TrendingUp className="w-3 h-3" />
              {overview.resolvedChange}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-800">
              {overview.resolvedComplaints.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
              <TrendingDown className="w-3 h-3" />
              {overview.pendingChange}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-800">
              {overview.pendingComplaints.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Pending</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <Timer className="w-5 h-5 text-violet-600" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
              <TrendingDown className="w-3 h-3" />
              {overview.avgTimeChange}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-800">
              {overview.avgResolutionTime}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Avg Resolution Time</p>
          </div>
        </div>
      </div>

      {/* Category breakdown + Status distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              {categories.reduce((a, c) => a + c.count, 0).toLocaleString()} total
            </span>
          </div>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {cat.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", cat.color)}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Status Distribution
            </h3>
          </div>

          {/* Stacked bar */}
          <div className="flex h-8 rounded-lg overflow-hidden mb-6">
            {statusDist.map((s) => (
              <div
                key={s.status}
                className={cn("transition-all duration-500", statusColors[s.status])}
                style={{ width: `${s.percentage}%` }}
                title={`${s.status}: ${s.count.toLocaleString()} (${s.percentage}%)`}
              />
            ))}
          </div>

          {/* Legend + details */}
          <div className="space-y-3">
            {statusDist.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn("w-3 h-3 rounded-full", statusColors[s.status])}
                  />
                  <span className="text-sm text-slate-700">{s.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-800">
                    {s.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 w-12 text-right">
                    {s.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend visualization */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-800">
            Monthly Trend
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600">Filed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Resolved</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-48">
          {trends.map((t) => (
            <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: "160px" }}>
                <div
                  className="flex-1 max-w-5 bg-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${(t.complaints / maxTrend) * 100}%` }}
                  title={`Filed: ${t.complaints}`}
                />
                <div
                  className="flex-1 max-w-5 bg-emerald-500 rounded-t transition-all duration-500"
                  style={{ height: `${(t.resolved / maxTrend) * 100}%` }}
                  title={`Resolved: ${t.resolved}`}
                />
              </div>
              <span className="text-[10px] text-slate-500">{t.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top areas table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">
            Top Areas by Complaints
          </h3>
          <Link href="/dashboard/map" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Area
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Resolved
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Pending
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Resolution Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topAreas.map((area) => (
                <tr
                  key={area.area}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-slate-700">
                      {area.area}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-700">
                      {area.totalComplaints.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-emerald-600 font-medium">
                      {area.resolved.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-amber-600 font-medium">
                      {area.pending.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: area.resolutionRate }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {area.resolutionRate}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
