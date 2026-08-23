"use client";

import React, { useEffect, useState } from "react";
import { Loader2, MapPin, Filter } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import apiClient from "@/lib/api-client";

const categoryFilters = [
  { label: "All", value: "" },
  { label: "Roads", value: "roads-potholes" },
  { label: "Garbage", value: "garbage-waste" },
  { label: "Street Lights", value: "street-lights" },
  { label: "Water", value: "water-supply" },
  { label: "Drainage", value: "drainage-sewage" },
  { label: "Safety", value: "public-safety" },
];

export default function MapPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await apiClient.get("/complaints/public", {
          params: { limit: 100 },
        });
        setComplaints(res.data.data?.items || res.data.items || []);
      } catch {
        console.error("Failed to fetch public complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = selectedCategory
    ? complaints.filter((c) => c.category?.slug === selectedCategory)
    : complaints;

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 4rem)" }}>
        {/* Map Area */}
        <div className="flex-1 relative bg-gray-100 min-h-[50vh] lg:min-h-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">
                Map View
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Leaflet / Mapbox integration to be configured
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {filtered.length} complaints with location data
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 border-l border-gray-200 bg-white flex flex-col">
          {/* Filters */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complaint List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                No complaints found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-gray-400">{c.publicId}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.address && (
                      <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.address}
                      </p>
                    )}
                    {c.category && (
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {c.category.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
