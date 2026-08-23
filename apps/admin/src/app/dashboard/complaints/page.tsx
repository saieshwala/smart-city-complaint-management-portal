"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ArrowUpDown,
  MapPin,
  Droplets,
  Zap,
  Trash2,
  TreePine,
  Bus,
  Volume2,
  Construction,
  Building,
  AlertTriangle,
  HelpCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge, { type ComplaintStatus } from "@/components/StatusBadge";
import PriorityBadge, { type Priority } from "@/components/PriorityBadge";
import apiClient from "@/lib/api-client";

// --- Types ---

interface Complaint {
  id: string;
  publicId: string;
  category: string;
  categoryIcon: string;
  priority: Priority;
  location: string;
  fullAddress: string;
  reportedAt: string;
  status: ComplaintStatus;
  assignedOfficer: string | null;
  slaDeadline: string | null;
  description: string;
}

// --- Category icon mapping ---

const categoryIcons: Record<string, React.ElementType> = {
  Roads: Construction,
  "Waste Management": Trash2,
  Water: Droplets,
  "Street Lighting": Zap,
  Electricity: Zap,
  Sewerage: Droplets,
  Sanitation: Trash2,
  Parks: TreePine,
  Transport: Bus,
  Noise: Volume2,
  "Public Infrastructure": Building,
  Building: Building,
  Environment: TreePine,
  Safety: AlertTriangle,
  Other: HelpCircle,
};

// --- Helpers ---

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function getSlaStatus(deadline: string | null): { text: string; isOverdue: boolean; urgency: string } {
  if (!deadline) return { text: "No SLA", isOverdue: false, urgency: "ok" };

  const now = new Date();
  const sla = new Date(deadline);
  const diffMs = sla.getTime() - now.getTime();

  if (diffMs <= 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    return {
      text: overdueDays > 0 ? `${overdueDays}d overdue` : `${overdueHours}h overdue`,
      isOverdue: true,
      urgency: "critical",
    };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  if (hoursLeft < 24) {
    return { text: `${hoursLeft}h left`, isOverdue: false, urgency: "warning" };
  }
  return { text: `${daysLeft}d left`, isOverdue: false, urgency: "ok" };
}

function shortenAddress(address: string | null): string {
  if (!address) return "Unknown";
  // Take the first two comma-separated parts
  const parts = address.split(",").map((p) => p.trim());
  return parts.slice(0, 2).join(", ");
}

function mapApiComplaint(item: any): Complaint {
  const catName = item.category?.name || "Other";
  return {
    id: item.id,
    publicId: item.publicId,
    category: catName,
    categoryIcon: catName,
    priority: item.priority || "MEDIUM",
    location: shortenAddress(item.address),
    fullAddress: item.address || "",
    reportedAt: item.reportedAt || item.createdAt,
    status: item.status,
    assignedOfficer: item.assignedOfficer?.name || null,
    slaDeadline: item.expectedResolutionAt || null,
    description: item.description || "",
  };
}

// --- Columns ---

const columnHelper = createColumnHelper<Complaint>();

const categories = [
  "Roads",
  "Water",
  "Waste Management",
  "Street Lighting",
  "Sewerage",
  "Traffic",
  "Public Infrastructure",
  "Environment",
  "Other",
];

const statuses: ComplaintStatus[] = [
  "SUBMITTED",
  "ACCEPTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "ON_HOLD",
  "INFO_REQUESTED",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
  "DUPLICATE",
  "ESCALATED",
];

const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const statusLabels: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  INFO_REQUESTED: "Info Requested",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
  ESCALATED: "Escalated",
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/complaints", {
        params: { limit: 200 },
      });
      const data = res.data;
      // Handle different response shapes from the TransformInterceptor
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.data || [];
      setComplaints(items.map(mapApiComplaint));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load complaints";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredData = useMemo(() => {
    let data = complaints;

    if (categoryFilter) {
      data = data.filter((c) => c.category === categoryFilter);
    }
    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter);
    }
    if (priorityFilter) {
      data = data.filter((c) => c.priority === priorityFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((c) => new Date(c.reportedAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter((c) => new Date(c.reportedAt) <= to);
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter(
        (c) =>
          c.publicId.toLowerCase().includes(q) ||
          c.fullAddress.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    return data;
  }, [complaints, categoryFilter, statusFilter, priorityFilter, dateFrom, dateTo, globalFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("publicId", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
            onClick={() => column.toggleSorting()}
          >
            Complaint ID
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => (
          <span className="text-sm font-mono font-medium text-primary-600">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => {
          const IconComp = categoryIcons[info.getValue()] || HelpCircle;
          return (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                <IconComp className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm text-slate-700">{info.getValue()}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("priority", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
            onClick={() => column.toggleSorting()}
          >
            Priority
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => <PriorityBadge priority={info.getValue()} />,
        sortingFn: (rowA, rowB) => {
          const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (
            (order[rowA.original.priority] || 0) -
            (order[rowB.original.priority] || 0)
          );
        },
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-[180px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate" title={info.row.original.fullAddress}>
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("reportedAt", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
            onClick={() => column.toggleSorting()}
          >
            Reported
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => (
          <span className="text-sm text-slate-500">
            {getRelativeTime(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("assignedOfficer", {
        header: "Assigned Officer",
        cell: (info) => (
          <span
            className={cn(
              "text-sm",
              info.getValue() ? "text-slate-700" : "text-slate-400 italic"
            )}
          >
            {info.getValue() || "Unassigned"}
          </span>
        ),
      }),
      columnHelper.accessor("slaDeadline", {
        header: "SLA",
        cell: (info) => {
          const sla = getSlaStatus(info.getValue());
          return (
            <span
              className={cn(
                "text-sm font-medium",
                sla.isOverdue
                  ? "text-red-600"
                  : sla.urgency === "warning"
                  ? "text-amber-600"
                  : "text-slate-600"
              )}
            >
              {sla.isOverdue && (
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              )}
              {sla.text}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <Link
            href={`/dashboard/complaints/${info.row.original.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const clearFilters = () => {
    setGlobalFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setDateFrom("");
    setDateTo("");
    setColumnFilters([]);
  };

  const hasFilters =
    globalFilter || categoryFilter || statusFilter || priorityFilter || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Complaint Queue</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and process citizen complaints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
          <div className="text-sm text-slate-500">
            {filteredData.length} complaint{filteredData.length !== 1 ? "s" : ""} found
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load complaints</p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchComplaints}
            className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, address, description..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder:text-slate-400"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-slate-700"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-slate-700"
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full py-2 px-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-slate-700"
              placeholder="From"
            />
            <span className="text-slate-400 text-xs flex-shrink-0">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full py-2 px-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-slate-700"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading complaints...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-12 text-center text-sm text-slate-500"
                      >
                        No complaints found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 gap-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                {filteredData.length === 0
                  ? 0
                  : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredData.length
                )}{" "}
                of {filteredData.length} complaints
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                      table.getState().pagination.pageIndex === i
                        ? "bg-primary-600 text-white border-primary-600"
                        : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
