"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ScrollText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Loader2,
  RefreshCw,
  ExternalLink,
  User,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

// --- Types ---

interface AuditLog {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId: string | null;
  complaintId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  admin: { id: string; name: string; email: string } | null;
  user: { id: string; name: string; email: string } | null;
  complaint: { id: string; publicId: string; title: string } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionTypes = [
  "All",
  "STATUS_CHANGE",
  "ASSIGNMENT",
  "PRIORITY_CHANGE",
  "CREATE",
  "UPDATE",
  "DELETE",
  "COMMENT",
  "ESCALATION",
  "LOGIN",
  "LOGOUT",
];

const actionColors: Record<string, string> = {
  STATUS_CHANGE: "bg-blue-100 text-blue-700",
  ASSIGNMENT: "bg-indigo-100 text-indigo-700",
  PRIORITY_CHANGE: "bg-orange-100 text-orange-700",
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  COMMENT: "bg-slate-100 text-slate-700",
  ESCALATION: "bg-purple-100 text-purple-700",
  LOGIN: "bg-cyan-100 text-cyan-700",
  LOGOUT: "bg-gray-100 text-gray-700",
};

const entityTypeColors: Record<string, string> = {
  Complaint: "text-primary-600",
  Department: "text-emerald-600",
  Officer: "text-amber-600",
  RoutingRule: "text-violet-600",
  Session: "text-slate-500",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: pagination.limit,
        };
        if (actionFilter !== "All") params.action = actionFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        if (searchTerm) params.search = searchTerm;

        const res = await apiClient.get("/admin/audit-logs", { params });
        const data = res.data;
        // Handle TransformInterceptor response shape
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        const meta = data?.meta || data?.pagination;
        setLogs(items);
        if (meta) {
          setPagination({
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            totalPages: meta.totalPages,
          });
        }
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [actionFilter, dateFrom, dateTo, searchTerm, pagination.limit]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDetails = (log: AuditLog): string => {
    const { action, oldValues, newValues } = log;
    switch (action) {
      case "STATUS_CHANGE":
        return `Changed status from "${oldValues?.status || "?"}" to "${newValues?.status || "?"}"${newValues?.reason ? ` — ${newValues.reason}` : ""}`;
      case "ASSIGNMENT":
        return `Assigned to ${newValues?.officerName || "officer"}`;
      case "COMMENT":
        return `Added note: "${(newValues?.note || "").slice(0, 80)}${(newValues?.note || "").length > 80 ? "..." : ""}"`;
      case "PRIORITY_CHANGE":
        return `Changed priority from "${oldValues?.priority || "?"}" to "${newValues?.priority || "?"}"`;
      case "CREATE":
        return `Created ${log.entityType}`;
      case "UPDATE":
        return `Updated ${log.entityType}`;
      case "DELETE":
        return `Deleted ${log.entityType}`;
      case "LOGIN":
        return `Admin login${log.ipAddress ? ` from ${log.ipAddress}` : ""}`;
      default:
        return `${action.replace(/_/g, " ")} on ${log.entityType}`;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((p) => ({ ...p, page: newPage }));
    fetchLogs(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track all administrative actions and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                filterOpen && "rotate-180"
              )}
            />
          </button>
          <button
            onClick={() => fetchLogs(pagination.page)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Admin, entity ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Action type filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {actionTypes.map((a) => (
                  <option key={a} value={a}>
                    {a === "All" ? "All Actions" : a.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit logs table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Activity Log
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {pagination.total} total entries
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-2 text-sm text-slate-500">Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ScrollText className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No audit logs yet</p>
            <p className="text-xs text-slate-400 mt-1">Actions taken in the admin panel will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Timestamp
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Admin
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Action
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Entity Type
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Entity ID
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Complaint ID
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {log.admin?.name || log.user?.name || "System"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {log.admin?.email || log.user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          actionColors[log.action] || "bg-slate-100 text-slate-700"
                        )}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          entityTypeColors[log.entityType] || "text-slate-600"
                        )}
                      >
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-600">
                        {log.complaint?.publicId || log.entityId?.slice(0, 8) || "--"}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {log.complaintId ? (
                        <Link
                          href={`/dashboard/complaints/${log.complaintId}`}
                          className="inline-flex items-center gap-1 text-sm font-mono text-primary-600 hover:text-primary-700 cursor-pointer"
                        >
                          {log.complaint?.publicId || log.complaintId.slice(0, 8)}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">--</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-600 max-w-xs truncate block">
                        {formatDetails(log)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-500">
            {pagination.total > 0
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} entries`
              : "No entries"}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium border rounded-md transition-colors",
                    pageNum === pagination.page
                      ? "text-white bg-primary-600 border-primary-600 hover:bg-primary-700"
                      : "text-slate-600 bg-white border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
