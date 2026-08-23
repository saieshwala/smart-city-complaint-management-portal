"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import apiClient from "@/lib/api-client";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  UserPlus,
  Play,
  MessageSquare,
  ArrowUpCircle,
  Copy,
  Brain,
  Camera,
  FileText,
  Shield,
  Send,
  Info,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// --- Types ---

interface ComplaintDetail {
  id: string;
  publicId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  createdAt: string;
  submittedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  expectedResolutionAt: string | null;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  authority: { id: string; name: string; type: string } | null;
  department: { id: string; name: string } | null;
  assignedOfficer: { id: string; name: string; email: string } | null;
  user: { id: string; name: string; email: string; phone?: string } | null;
  images: { id: string; storageKey: string; isPrimary: boolean }[];
  statusHistory: {
    id: string;
    oldStatus: string | null;
    newStatus: string;
    reason: string | null;
    createdAt: string;
    changedByAdminId?: string | null;
    changedByUserId?: string | null;
  }[];
  adminNotes: {
    id: string;
    note: string;
    createdAt: string;
    admin: { id: string; name: string };
  }[];
  aiAnalyses: {
    id: string;
    category: string | null;
    confidence: number | null;
    severity: string | null;
    evidence: string[] | null;
    rawResponse: any;
    createdAt: string;
  }[];
}

// --- Helpers ---

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSlaInfo(deadline: string | null): { text: string; isOverdue: boolean } | null {
  if (!deadline) return null;
  const now = new Date();
  const sla = new Date(deadline);
  const diffMs = sla.getTime() - now.getTime();

  if (diffMs <= 0) {
    const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    return { text: `Overdue by ${overdueHours}h`, isOverdue: true };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  return { text: `${hoursLeft}h remaining`, isOverdue: false };
}

// --- Status-based actions ---

function getAvailableActions(status: string) {
  const allActions = {
    accept: {
      label: "Accept Complaint",
      icon: CheckCircle2,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
      newStatus: "RECEIVED",
    },
    assign: {
      label: "Assign Officer",
      icon: UserPlus,
      color: "bg-primary-600 hover:bg-primary-700 text-white",
      newStatus: "ASSIGNED",
    },
    startWork: {
      label: "Start Work",
      icon: Play,
      color: "bg-amber-600 hover:bg-amber-700 text-white",
      newStatus: "IN_PROGRESS",
    },
    resolve: {
      label: "Mark Resolved",
      icon: CheckCircle2,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
      newStatus: "RESOLVED",
    },
    reject: {
      label: "Reject",
      icon: XCircle,
      color: "bg-white hover:bg-red-50 text-red-600 border border-red-300",
      newStatus: "REJECTED",
    },
    duplicate: {
      label: "Mark Duplicate",
      icon: Copy,
      color: "bg-white hover:bg-slate-50 text-slate-600 border border-slate-300",
      newStatus: "DUPLICATE",
    },
    escalate: {
      label: "Escalate",
      icon: ArrowUpCircle,
      color: "bg-red-600 hover:bg-red-700 text-white",
      newStatus: "ESCALATED",
    },
  };

  const actionsByStatus: Record<string, string[]> = {
    SUBMITTED: ["accept", "reject", "duplicate"],
    RECEIVED: ["assign", "reject", "duplicate", "escalate"],
    ASSIGNED: ["startWork", "reject", "escalate"],
    IN_PROGRESS: ["resolve", "escalate"],
    RESOLVED: ["escalate"],
    ESCALATED: ["assign", "resolve"],
  };

  const actionKeys = actionsByStatus[status] || [];
  return actionKeys.map((key) => ({ key, ...allActions[key as keyof typeof allActions] }));
}

const timelineColors: Record<string, string> = {
  DRAFT: "bg-slate-400",
  SUBMITTED: "bg-blue-500",
  RECEIVED: "bg-indigo-500",
  ASSIGNED: "bg-violet-500",
  IN_PROGRESS: "bg-amber-500",
  RESOLVED: "bg-emerald-500",
  CLOSED: "bg-gray-400",
  REJECTED: "bg-red-500",
  DUPLICATE: "bg-stone-400",
  ESCALATED: "bg-rose-500",
};

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/admin/complaints/${id}`);
      const data = res.data?.data || res.data;
      setComplaint(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load complaint";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string, reason?: string) => {
    if (!complaint) return;
    setUpdatingStatus(true);
    try {
      await apiClient.patch(`/admin/complaints/${complaint.id}/status`, {
        status: newStatus,
        reason: reason || `Status changed to ${formatStatus(newStatus)}`,
      });
      await fetchComplaint();
    } catch (err: any) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !complaint) return;
    setAddingNote(true);
    try {
      await apiClient.post(`/admin/complaints/${complaint.id}/notes`, {
        note: newNote.trim(),
      });
      setNewNote("");
      await fetchComplaint();
    } catch (err: any) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // --- Error state ---
  if (error || !complaint) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/complaints"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaint Queue
        </Link>
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600 font-medium">
            {error || "Complaint not found"}
          </p>
          <button
            onClick={fetchComplaint}
            className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sla = getSlaInfo(complaint.expectedResolutionAt);
  const actions = getAvailableActions(complaint.status);
  const aiAnalysis = complaint.aiAnalyses?.[0] || null;

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/dashboard/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Complaint Queue
      </Link>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - 2/3 */}
        <div className="xl:col-span-2 space-y-5">
          {/* Complaint Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <h2 className="text-xl font-bold text-slate-800 flex-1 min-w-0">
                {complaint.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {complaint.publicId}
              </span>
              <StatusBadge status={complaint.status as any} size="md" />
              <PriorityBadge priority={(complaint.priority || "MEDIUM") as any} size="md" />
              {complaint.category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  <FileText className="w-3.5 h-3.5" />
                  {complaint.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          {complaint.images.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Uploaded Images ({complaint.images.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.images.map((img, i) => (
                  <div
                    key={img.id}
                    className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/complaints/${complaint.id}/images/${img.id}`}
                      alt={`Complaint image ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                        <span className="text-xs text-slate-400">
                          Image {i + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {(complaint.latitude || complaint.address) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Complaint Location
                </h3>
              </div>
              <div className="relative h-48 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <MapPin className="w-10 h-10 text-red-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">
                    {complaint.address || "Location provided"}
                  </p>
                  {complaint.latitude && complaint.longitude && (
                    <p className="text-xs text-slate-400 mt-1">
                      {Number(complaint.latitude).toFixed(4)}, {Number(complaint.longitude).toFixed(4)}
                    </p>
                  )}
                  {(complaint.city || complaint.district || complaint.state) && (
                    <p className="text-xs text-slate-400">
                      {[complaint.city, complaint.district, complaint.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                Description
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* AI Analysis Card */}
          {aiAnalysis && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  AI Analysis
                </h3>
                <span className="ml-auto text-xs text-slate-400">
                  {formatDate(aiAnalysis.createdAt)}
                </span>
              </div>

              <div className="space-y-4">
                {/* Detected Category */}
                {aiAnalysis.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Detected Category
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {aiAnalysis.category}
                    </span>
                  </div>
                )}

                {/* Confidence Bar */}
                {aiAnalysis.confidence != null && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        AI Confidence
                      </span>
                      <span className="text-sm font-bold text-violet-600">
                        {aiAnalysis.confidence}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${aiAnalysis.confidence}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Severity */}
                {aiAnalysis.severity && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Severity Assessment
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                      {aiAnalysis.severity}
                    </span>
                  </div>
                )}

                {/* Evidence */}
                {aiAnalysis.evidence && aiAnalysis.evidence.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-2">
                      Detected Evidence
                    </span>
                    <ul className="space-y-1.5">
                      {aiAnalysis.evidence.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-5">
          {/* Status & Assignment Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              Status & Assignment
            </h3>
            <div className="space-y-4">
              {/* Current Status */}
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                  Current Status
                </span>
                <StatusBadge status={complaint.status as any} size="lg" />
              </div>

              {/* Assigned Officer */}
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                  Assigned Officer
                </span>
                {complaint.assignedOfficer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {complaint.assignedOfficer.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {complaint.assignedOfficer.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Unassigned</p>
                )}
              </div>

              {/* Department */}
              {complaint.department && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                    Department
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Building className="w-4 h-4 text-slate-400" />
                    {complaint.department.name}
                  </div>
                </div>
              )}

              {/* Authority */}
              {complaint.authority && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                    Authority
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Building className="w-4 h-4 text-slate-400" />
                    {complaint.authority.name}
                  </div>
                </div>
              )}

              {/* SLA */}
              {sla && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                    SLA Deadline
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      sla.isOverdue ? "text-red-600" : "text-amber-600"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {sla.text}
                    {sla.isOverdue && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded uppercase">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(complaint.expectedResolutionAt!)}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                  Created
                </span>
                <p className="text-sm text-slate-600">
                  {formatDate(complaint.createdAt)}
                </p>
              </div>
              {complaint.submittedAt && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                    Submitted
                  </span>
                  <p className="text-sm text-slate-600">
                    {formatDate(complaint.submittedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {actions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                Actions
              </h3>
              <div className="space-y-2">
                {actions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => handleStatusUpdate(action.newStatus)}
                    disabled={updatingStatus}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50",
                      action.color
                    )}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline / History */}
          {complaint.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Timeline
              </h3>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

                <div className="space-y-5">
                  {complaint.statusHistory.map((event) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 border-white flex-shrink-0 mt-0.5 z-10 shadow-sm",
                          timelineColors[event.newStatus] || "bg-slate-400"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-800">
                            {formatStatus(event.newStatus)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>
                        {event.reason && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {event.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Admin Notes ({complaint.adminNotes.length})
            </h3>

            {/* Existing notes */}
            {complaint.adminNotes.length > 0 && (
              <div className="space-y-3 mb-4">
                {complaint.adminNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-slate-700">
                        {note.admin.name}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-200 text-slate-600 rounded">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {note.note}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add note */}
            <div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an admin note..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder:text-slate-400 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {addingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>

          {/* Citizen Info */}
          {complaint.user && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Citizen Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">
                    Name
                  </span>
                  <p className="text-sm text-slate-700 font-medium">
                    {complaint.user.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">
                    Email
                  </span>
                  <p className="text-sm text-slate-700">
                    {complaint.user.email}
                  </p>
                </div>
                {complaint.user.phone && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">
                      Phone
                    </span>
                    <p className="text-sm text-slate-700">
                      {complaint.user.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
