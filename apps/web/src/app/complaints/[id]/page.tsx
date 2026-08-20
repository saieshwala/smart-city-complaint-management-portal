"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { PriorityBadge } from "@/components/complaints/PriorityBadge";
import { StatusTimeline } from "@/components/complaints/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { useAuthContext } from "@/context/AuthContext";
import apiClient from "@/lib/api-client";

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !params.id) return;

    const fetchComplaint = async () => {
      try {
        const res = await apiClient.get(`/complaints/${params.id}`);
        setComplaint(res.data.data || res.data);
      } catch {
        setError("Failed to load complaint details");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [isAuthenticated, params.id]);

  const handleVerify = async (verified: boolean) => {
    setActionLoading(true);
    try {
      await apiClient.post(`/complaints/${params.id}/verify`, { verified });
      const res = await apiClient.get(`/complaints/${params.id}`);
      setComplaint(res.data.data || res.data);
    } catch {
      setError("Failed to update verification");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    setActionLoading(true);
    try {
      await apiClient.post(`/complaints/${params.id}/reopen`, {
        reason: "Citizen requested reopening",
      });
      const res = await apiClient.get(`/complaints/${params.id}`);
      setComplaint(res.data.data || res.data);
    } catch {
      setError("Failed to reopen complaint");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to complaints
          </Link>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {complaint && (
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-500">{complaint.publicId}</p>
                    <h1 className="mt-1 text-xl font-bold text-gray-900">{complaint.title}</h1>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-700">{complaint.description}</p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  {complaint.category && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {complaint.category.name}
                    </span>
                  )}
                  {complaint.address && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {complaint.address}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Authority & Department */}
                {(complaint.authority || complaint.department) && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Assigned To</p>
                    {complaint.authority && (
                      <p className="text-sm font-medium text-gray-900">{complaint.authority.name}</p>
                    )}
                    {complaint.department && (
                      <p className="text-sm text-gray-600">{complaint.department.name}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {complaint.status === "RESOLVED" && (
                  <div className="mt-4 flex gap-3 border-t border-gray-100 pt-4">
                    <Button
                      onClick={() => handleVerify(true)}
                      loading={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Confirm Resolution
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleVerify(false)}
                      loading={actionLoading}
                    >
                      Issue Not Resolved
                    </Button>
                  </div>
                )}

                {(complaint.status === "CLOSED" || complaint.status === "RESOLVED") && (
                  <div className="mt-3">
                    <Button variant="ghost" onClick={handleReopen} loading={actionLoading}>
                      <RotateCcw className="h-4 w-4" /> Reopen Complaint
                    </Button>
                  </div>
                )}
              </div>

              {/* Images */}
              {complaint.images && complaint.images.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {complaint.images.map((img: any) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500"
                      >
                        Image: {img.originalFilename || img.storageKey}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              {complaint.statusHistory && (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
                  <StatusTimeline history={complaint.statusHistory} />
                </div>
              )}

              {/* SLA Info */}
              {complaint.expectedResolutionAt && (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Expected Resolution</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(complaint.expectedResolutionAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
