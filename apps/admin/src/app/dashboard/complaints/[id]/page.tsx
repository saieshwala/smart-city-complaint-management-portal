"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Building,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  UserPlus,
  Play,
  MessageSquare,
  AlertTriangle,
  ArrowUpCircle,
  Copy,
  X,
  ChevronRight,
  Brain,
  Camera,
  FileText,
  Shield,
  Send,
  BadgeCheck,
  Info,
} from "lucide-react";

// --- Mock data for a single complaint ---

const complaint = {
  id: "CIV-2026-000183",
  title: "Main Water Pipeline Burst on Paud Road",
  description:
    "A major water pipeline has burst near Dahanukar Colony on Paud Road, Kothrud. Water is flooding the road surface and making it extremely difficult for pedestrians and vehicles to pass. The leak has been ongoing since early morning and multiple residents in the vicinity are facing water supply disruption. Immediate repair is requested. The water pressure in surrounding buildings has dropped significantly. Local shops are also affected as the flooding is entering some ground-floor establishments.",
  category: "Water",
  priority: "CRITICAL" as const,
  status: "ACCEPTED" as const,
  location: {
    address: "Paud Road, Kothrud, Near Dahanukar Colony, Pune 411038",
    lat: 18.5074,
    lng: 73.8077,
    ward: "Kothrud-Bavdhan",
    pincode: "411038",
  },
  reportedAt: "2026-08-15T10:15:00Z",
  assignedOfficer: {
    name: "Rajesh Kulkarni",
    designation: "Junior Engineer",
    department: "Water Supply Department",
    phone: "+91-XXXXX-XXXXX",
  },
  department: "Water Supply Department",
  slaDeadline: "2026-08-16T10:15:00Z",
  externalRef: "PMC/WS/2026/4821",
  citizen: {
    name: "Anand Mehra",
    reportDate: "15 Aug 2026, 10:15 AM",
    isVerified: true,
  },
  images: [
    "/placeholder-complaint-1.jpg",
    "/placeholder-complaint-2.jpg",
    "/placeholder-complaint-3.jpg",
  ],
  aiAnalysis: {
    provider: "CivicConnect AI v2.1",
    detectedCategory: "Water Supply / Pipeline",
    confidence: 94,
    severity: "HIGH",
    evidenceList: [
      "Water pooling visible on road surface",
      "Pipeline infrastructure damage detected",
      "Multiple affected structures in frame",
      "Road surface degradation from water exposure",
    ],
  },
  timeline: [
    {
      id: 1,
      status: "SUBMITTED",
      date: "15 Aug 2026",
      time: "10:15 AM",
      who: "Anand Mehra (Citizen)",
      reason: "Complaint filed via mobile app",
      color: "bg-blue-500",
    },
    {
      id: 2,
      status: "ACCEPTED",
      date: "15 Aug 2026",
      time: "10:42 AM",
      who: "System (Auto-Accept)",
      reason: "High priority complaint auto-accepted based on AI analysis",
      color: "bg-indigo-500",
    },
    {
      id: 3,
      status: "ASSIGNED",
      date: "15 Aug 2026",
      time: "11:05 AM",
      who: "Admin: Priya Nair",
      reason: "Assigned to Rajesh Kulkarni, Water Supply Dept",
      color: "bg-violet-500",
    },
    {
      id: 4,
      status: "ACCEPTED",
      date: "15 Aug 2026",
      time: "11:30 AM",
      who: "Rajesh Kulkarni",
      reason: "Officer acknowledged and is en route",
      color: "bg-indigo-500",
    },
  ],
  notes: [
    {
      id: 1,
      author: "Priya Nair",
      role: "Admin",
      date: "15 Aug 2026, 11:10 AM",
      text: "Assigned to Rajesh as he is closest to the location. This is a critical pipeline that serves approx 200 households.",
    },
    {
      id: 2,
      author: "Rajesh Kulkarni",
      role: "Field Officer",
      date: "15 Aug 2026, 12:30 PM",
      text: "Reached site. 12-inch main pipeline has a 2-foot crack. Requested emergency repair crew. Estimated 4-6 hours for repair.",
    },
  ],
};

// --- Helper ---

function getSlaCountdown(): { text: string; isOverdue: boolean } {
  const now = new Date("2026-08-16T12:00:00Z");
  const sla = new Date(complaint.slaDeadline);
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
    },
    assign: {
      label: "Assign Officer",
      icon: UserPlus,
      color: "bg-primary-600 hover:bg-primary-700 text-white",
    },
    startWork: {
      label: "Start Work",
      icon: Play,
      color: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    requestInfo: {
      label: "Request Information",
      icon: MessageSquare,
      color: "bg-orange-600 hover:bg-orange-700 text-white",
    },
    resolve: {
      label: "Mark Resolved",
      icon: CheckCircle2,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    reject: {
      label: "Reject",
      icon: XCircle,
      color: "bg-white hover:bg-red-50 text-red-600 border border-red-300",
    },
    duplicate: {
      label: "Mark Duplicate",
      icon: Copy,
      color: "bg-white hover:bg-slate-50 text-slate-600 border border-slate-300",
    },
    escalate: {
      label: "Escalate",
      icon: ArrowUpCircle,
      color: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const actionsByStatus: Record<string, string[]> = {
    SUBMITTED: ["accept", "reject", "duplicate"],
    ACCEPTED: ["assign", "reject", "duplicate", "escalate"],
    ASSIGNED: ["startWork", "requestInfo", "reject", "escalate"],
    IN_PROGRESS: ["resolve", "requestInfo", "escalate"],
    ON_HOLD: ["startWork", "resolve", "escalate"],
    INFO_REQUESTED: ["startWork", "resolve", "reject"],
    ESCALATED: ["assign", "resolve"],
  };

  const actionKeys = actionsByStatus[status] || [];
  return actionKeys.map((key) => ({ key, ...allActions[key as keyof typeof allActions] }));
}

export default function ComplaintDetailPage() {
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(complaint.notes);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  const sla = getSlaCountdown();
  const actions = getAvailableActions(complaint.status);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([
      ...notes,
      {
        id: notes.length + 1,
        author: "Admin Officer",
        role: "Admin",
        date: "16 Aug 2026, 12:00 PM",
        text: newNote.trim(),
      },
    ]);
    setNewNote("");
  };

  const officers = [
    "Rajesh Kulkarni",
    "Priya Sharma",
    "Amit Deshmukh",
    "Sneha Patil",
    "Vikram Joshi",
  ];

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
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} size="md" />
              <PriorityBadge priority={complaint.priority} size="md" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                <FileText className="w-3.5 h-3.5" />
                {complaint.category}
              </span>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                Uploaded Images ({complaint.images.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {complaint.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxImage(img)}
                  className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:border-primary-400 transition-colors group"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-xs text-slate-400">
                        Image {i + 1}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium bg-black/50 px-2 py-1 rounded">
                      Click to enlarge
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
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
                  {complaint.location.address}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
                </p>
                <p className="text-xs text-slate-400">
                  Ward: {complaint.location.ward} | PIN: {complaint.location.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                Description
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                AI Analysis
              </h3>
              <span className="ml-auto text-xs text-slate-400">
                {complaint.aiAnalysis.provider}
              </span>
            </div>

            <div className="space-y-4">
              {/* Detected Category */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Detected Category
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {complaint.aiAnalysis.detectedCategory}
                </span>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    AI Confidence
                  </span>
                  <span className="text-sm font-bold text-violet-600">
                    {complaint.aiAnalysis.confidence}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500"
                    style={{ width: `${complaint.aiAnalysis.confidence}%` }}
                  />
                </div>
              </div>

              {/* Severity */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Severity Assessment
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                  {complaint.aiAnalysis.severity}
                </span>
              </div>

              {/* Evidence */}
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-2">
                  Detected Evidence
                </span>
                <ul className="space-y-1.5">
                  {complaint.aiAnalysis.evidenceList.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
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
                <StatusBadge status={complaint.status} size="lg" />
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
                        {complaint.assignedOfficer.designation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Unassigned</p>
                )}
              </div>

              {/* Department */}
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                  Department
                </span>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Building className="w-4 h-4 text-slate-400" />
                  {complaint.department}
                </div>
              </div>

              {/* SLA */}
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
                  {new Date(complaint.slaDeadline).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* External Ref */}
              {complaint.externalRef && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">
                    External Reference
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{complaint.externalRef}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              Actions
            </h3>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.key} className="relative">
                  <button
                    onClick={() => {
                      if (action.key === "assign") {
                        setShowAssignDropdown(!showAssignDropdown);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      action.color
                    )}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                  {action.key === "assign" && showAssignDropdown && (
                    <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10">
                      {officers.map((officer) => (
                        <button
                          key={officer}
                          onClick={() => setShowAssignDropdown(false)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {officer}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline / History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Timeline
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

              <div className="space-y-5">
                {complaint.timeline.map((event, i) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 border-white flex-shrink-0 mt-0.5 z-10 shadow-sm",
                        event.color
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-800">
                          {event.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {event.date}, {event.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {event.who}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {event.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Admin Notes ({notes.length})
            </h3>

            {/* Existing notes */}
            <div className="space-y-3 mb-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-slate-700">
                      {note.author}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-200 text-slate-600 rounded">
                      {note.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {note.text}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {note.date}
                  </p>
                </div>
              ))}
            </div>

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
                disabled={!newNote.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Add Note
              </button>
            </div>
          </div>

          {/* Citizen Info */}
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
                  {complaint.citizen.name}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">
                  Report Date
                </span>
                <p className="text-sm text-slate-700">
                  {complaint.citizen.reportDate}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">
                  Verification
                </span>
                <div className="flex items-center gap-1.5">
                  {complaint.citizen.isVerified ? (
                    <>
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">
                        Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        Unverified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-3xl w-full aspect-video bg-slate-800 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-slate-500 mb-3" />
              <p className="text-slate-400 text-sm">
                Image preview placeholder
              </p>
              <p className="text-slate-500 text-xs mt-1">{lightboxImage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
