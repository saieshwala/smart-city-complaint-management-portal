"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Layers,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- Types ---

interface MapComplaint {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  lat: number;
  lng: number;
  date: string;
}

// --- Mock data ---

const mockComplaints: MapComplaint[] = [
  {
    id: "CMP-2024-12847",
    title: "Pothole on main road",
    category: "Roads & Infrastructure",
    status: "In Progress",
    priority: "High",
    location: "MG Road, Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    date: "2024-12-15",
  },
  {
    id: "CMP-2024-12846",
    title: "Water supply disruption",
    category: "Water Supply",
    status: "New",
    priority: "Critical",
    location: "Sector 15, Noida",
    lat: 28.5855,
    lng: 77.31,
    date: "2024-12-15",
  },
  {
    id: "CMP-2024-12845",
    title: "Street light not working",
    category: "Electricity",
    status: "Assigned",
    priority: "Medium",
    location: "Andheri West, Mumbai",
    lat: 19.1364,
    lng: 72.8296,
    date: "2024-12-14",
  },
  {
    id: "CMP-2024-12844",
    title: "Garbage not collected",
    category: "Sanitation",
    status: "In Progress",
    priority: "High",
    location: "Connaught Place, Delhi",
    lat: 28.6315,
    lng: 77.2167,
    date: "2024-12-14",
  },
  {
    id: "CMP-2024-12843",
    title: "Bus route change request",
    category: "Public Transport",
    status: "Resolved",
    priority: "Low",
    location: "T Nagar, Chennai",
    lat: 13.0418,
    lng: 80.2341,
    date: "2024-12-13",
  },
  {
    id: "CMP-2024-12842",
    title: "Broken park bench",
    category: "Parks & Recreation",
    status: "New",
    priority: "Low",
    location: "Cubbon Park, Bengaluru",
    lat: 12.9763,
    lng: 77.5929,
    date: "2024-12-13",
  },
];

const statusOptions = ["All", "New", "Assigned", "In Progress", "Resolved", "Closed"];
const categoryOptions = [
  "All",
  "Roads & Infrastructure",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Public Transport",
  "Parks & Recreation",
];

const priorityColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Assigned: "bg-indigo-100 text-indigo-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-700",
};

const statusIcons: Record<string, typeof Clock> = {
  New: AlertTriangle,
  Assigned: FileText,
  "In Progress": Clock,
  Resolved: CheckCircle2,
  Closed: CheckCircle2,
};

export default function MapViewPage() {
  const [complaints, setComplaints] = useState<MapComplaint[]>(mockComplaints);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<MapComplaint | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (categoryFilter !== "All" && c.category !== categoryFilter) return false;
    if (dateFrom && c.date < dateFrom) return false;
    if (dateTo && c.date > dateTo) return false;
    if (
      searchTerm &&
      !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: filteredComplaints.length,
    new: filteredComplaints.filter((c) => c.status === "New").length,
    inProgress: filteredComplaints.filter((c) => c.status === "In Progress").length,
    resolved: filteredComplaints.filter((c) => c.status === "Resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Map View</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Geographic visualization of complaints across regions
          </p>
        </div>
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
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500">Total on Map</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.new}</p>
              <p className="text-xs text-slate-500">New</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
              <p className="text-xs text-slate-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, title, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content: Map + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Complaint Map
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {filteredComplaints.length} complaints plotted
              </span>
            </div>
            <div className="relative h-[500px] bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-slate-500">
                  Map view - Leaflet/Mapbox integration pending
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Complaints will be displayed as interactive pins on the map
                </p>
              </div>

              {/* Mock pins overlay */}
              {filteredComplaints.map((complaint, index) => (
                <button
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={cn(
                    "absolute w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform",
                    complaint.status === "Resolved"
                      ? "bg-emerald-500"
                      : complaint.status === "In Progress"
                      ? "bg-amber-500"
                      : complaint.priority === "Critical"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  )}
                  style={{
                    top: `${20 + (index * 12) % 60}%`,
                    left: `${15 + (index * 17) % 70}%`,
                  }}
                  title={complaint.title}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Side panel - Complaint list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 h-[564px] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">
                Complaints ({filteredComplaints.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  No complaints match the current filters
                </div>
              ) : (
                filteredComplaints.map((complaint) => {
                  const StatusIcon = statusIcons[complaint.status] || FileText;
                  return (
                    <button
                      key={complaint.id}
                      onClick={() => setSelectedComplaint(complaint)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors",
                        selectedComplaint?.id === complaint.id && "bg-primary-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-medium text-primary-600">
                            {complaint.id}
                          </p>
                          <p className="text-sm text-slate-700 truncate mt-0.5">
                            {complaint.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500 truncate">
                              {complaint.location}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            statusColors[complaint.status]
                          )}
                        >
                          {complaint.status}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            priorityColors[complaint.priority]
                          )}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected complaint detail modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-mono font-medium text-primary-600">
                  {selectedComplaint.id}
                </p>
                <h3 className="text-lg font-semibold text-slate-800 mt-1">
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    statusColors[selectedComplaint.status]
                  )}
                >
                  {selectedComplaint.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Priority</span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    priorityColors[selectedComplaint.priority]
                  )}
                >
                  {selectedComplaint.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Category</span>
                <span className="text-sm text-slate-700">
                  {selectedComplaint.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Location</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {selectedComplaint.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Date</span>
                <span className="text-sm text-slate-700">
                  {selectedComplaint.date}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/dashboard/complaints/${selectedComplaint.id}`}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                View Details
              </Link>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
