"use client";

import React, { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { PriorityBadge } from "@/components/complaints/PriorityBadge";
import { StatusTimeline } from "@/components/complaints/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/api-client";

export default function TrackPage() {
  const [publicId, setPublicId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId.trim()) return;

    setLoading(true);
    setError("");
    setComplaint(null);
    setSearched(true);

    try {
      const res = await apiClient.get(`/public/complaints/${publicId.trim()}`);
      setComplaint(res.data.data || res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("No complaint found with this ID. Please check and try again.");
      } else {
        setError("Failed to search. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Complaint</h1>
            <p className="mt-2 text-gray-600">
              Enter your complaint ID to check the current status
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <Input
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              placeholder="e.g., CIV-2026-000001"
              className="flex-1"
            />
            <Button type="submit" loading={loading}>
              <Search className="h-4 w-4" /> Track
            </Button>
          </form>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 mb-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {searched && !loading && !error && !complaint && (
            <div className="text-center py-16 text-gray-500">
              No complaint found.
            </div>
          )}

          {complaint && (
            <div className="space-y-6">
              {/* Complaint Overview */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-mono text-gray-500">{complaint.publicId}</p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">{complaint.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                </div>

                {complaint.description && (
                  <p className="text-sm text-gray-700 mb-4">{complaint.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {complaint.category && (
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{complaint.category.name}</p>
                    </div>
                  )}
                  {complaint.address && (
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{complaint.address}</p>
                    </div>
                  )}
                  {complaint.authority && (
                    <div>
                      <p className="text-gray-500">Authority</p>
                      <p className="font-medium text-gray-900">{complaint.authority.name}</p>
                    </div>
                  )}
                  {complaint.expectedResolutionAt && (
                    <div>
                      <p className="text-gray-500">Expected Resolution</p>
                      <p className="font-medium text-gray-900">
                        {new Date(complaint.expectedResolutionAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {complaint.statusHistory && complaint.statusHistory.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                  <StatusTimeline history={complaint.statusHistory} />
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
