"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import { Button } from "@/components/ui/Button";
import { useAuthContext } from "@/context/AuthContext";
import apiClient from "@/lib/api-client";

interface Complaint {
  id: string;
  publicId: string;
  title: string;
  status: string;
  priority: string;
  category: { name: string; icon?: string } | null;
  address: string | null;
  createdAt: string;
}

export default function ComplaintsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchComplaints = async () => {
      try {
        const res = await apiClient.get("/complaints");
        const data = res.data;
        // Handle different response shapes from TransformInterceptor
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : data?.items || [];
        setComplaints(items);
      } catch {
        setError("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage your reported issues
              </p>
            </div>
            <Link href="/report">
              <Button>
                <Plus className="h-4 w-4" /> Report Issue
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No complaints yet</h3>
              <p className="mt-2 text-sm text-gray-600">
                Report your first civic issue to get started.
              </p>
              <Link href="/report" className="mt-4 inline-block">
                <Button>Report an Issue</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
