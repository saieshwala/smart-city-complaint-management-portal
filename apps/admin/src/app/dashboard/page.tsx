"use client";

import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// --- Mock data ---

const metricCards = [
  {
    title: "Total Complaints",
    value: "12,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: FileText,
    iconColor: "text-primary-600",
    iconBg: "bg-primary-50",
  },
  {
    title: "New Today",
    value: "142",
    change: "+8.2%",
    trend: "up" as const,
    icon: PlusCircle,
    iconColor: "text-saffron-600",
    iconBg: "bg-saffron-50",
  },
  {
    title: "In Progress",
    value: "3,421",
    change: "-2.4%",
    trend: "down" as const,
    icon: Clock,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    title: "Resolved",
    value: "8,126",
    change: "+18.7%",
    trend: "up" as const,
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    title: "Overdue",
    value: "487",
    change: "+5.1%",
    trend: "up" as const,
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
  },
  {
    title: "High Priority",
    value: "234",
    change: "-3.8%",
    trend: "down" as const,
    icon: Flame,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
  },
];

const categoryData = [
  { name: "Roads", complaints: 2845, resolved: 2100 },
  { name: "Water", complaints: 2340, resolved: 1890 },
  { name: "Electricity", complaints: 1980, resolved: 1650 },
  { name: "Sanitation", complaints: 1750, resolved: 1420 },
  { name: "Parks", complaints: 1200, resolved: 980 },
  { name: "Transport", complaints: 1080, resolved: 840 },
  { name: "Noise", complaints: 870, resolved: 720 },
  { name: "Other", complaints: 782, resolved: 526 },
];

const timelineData = [
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

const resolutionTimeData = [
  { month: "Jan", avgDays: 8.2 },
  { month: "Feb", avgDays: 7.8 },
  { month: "Mar", avgDays: 7.5 },
  { month: "Apr", avgDays: 6.9 },
  { month: "May", avgDays: 7.2 },
  { month: "Jun", avgDays: 6.5 },
  { month: "Jul", avgDays: 6.1 },
  { month: "Aug", avgDays: 5.8 },
  { month: "Sep", avgDays: 5.5 },
  { month: "Oct", avgDays: 5.2 },
  { month: "Nov", avgDays: 4.9 },
  { month: "Dec", avgDays: 4.6 },
];

const recentComplaints = [
  {
    id: "CMP-2024-12847",
    category: "Roads & Infrastructure",
    priority: "High",
    location: "MG Road, Bengaluru",
    status: "In Progress",
    date: "2024-12-15",
  },
  {
    id: "CMP-2024-12846",
    category: "Water Supply",
    priority: "Critical",
    location: "Sector 15, Noida",
    status: "New",
    date: "2024-12-15",
  },
  {
    id: "CMP-2024-12845",
    category: "Electricity",
    priority: "Medium",
    location: "Andheri West, Mumbai",
    status: "Assigned",
    date: "2024-12-14",
  },
  {
    id: "CMP-2024-12844",
    category: "Sanitation",
    priority: "High",
    location: "Connaught Place, Delhi",
    status: "In Progress",
    date: "2024-12-14",
  },
  {
    id: "CMP-2024-12843",
    category: "Public Transport",
    priority: "Low",
    location: "T Nagar, Chennai",
    status: "Resolved",
    date: "2024-12-13",
  },
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
};

export default function DashboardPage() {
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
          Last updated: just now
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
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                  card.trend === "up" && card.title !== "Overdue" && card.title !== "High Priority"
                    ? "text-emerald-700 bg-emerald-50"
                    : card.trend === "down" && (card.title === "Overdue" || card.title === "High Priority")
                    ? "text-emerald-700 bg-emerald-50"
                    : card.trend === "up"
                    ? "text-red-700 bg-red-50"
                    : "text-emerald-700 bg-emerald-50"
                )}
              >
                {card.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {card.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Complaints by Category - Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Complaints by Category
            </h3>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Bar
                  dataKey="complaints"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Total"
                />
                <Bar
                  dataKey="resolved"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Resolved"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Over Time - Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Complaints Over Time
            </h3>
            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View Report <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  name="Filed"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981" }}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Time - Area Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Avg. Resolution Time (Days)
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" />
              Improving
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={resolutionTimeData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorAvgDays"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#8b5cf6"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#8b5cf6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    `${value} days`,
                    "Avg. Resolution",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="avgDays"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAvgDays)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">
            Recent Complaints
          </h3>
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All Complaints <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
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
                >
                  <td className="px-5 py-3">
                    <span className="text-sm font-mono font-medium text-primary-600">
                      {complaint.id}
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
                        priorityColors[complaint.priority]
                      )}
                    >
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {complaint.location}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        statusColors[complaint.status]
                      )}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-500">
                      {complaint.date}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-500">
            Showing 5 of 12,847 complaints
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-primary-600 rounded-md hover:bg-primary-700 transition-colors">
              1
            </button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
              3
            </button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
