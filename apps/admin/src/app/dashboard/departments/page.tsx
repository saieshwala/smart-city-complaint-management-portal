"use client";

import { useState, useEffect } from "react";
import { Building2, Mail, Phone, Clock, Users, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  escalationHours: number;
  isActive: boolean;
  _count?: { complaints: number; routingRules: number };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiClient.get("/admin/departments");
        if (Array.isArray(res.data)) {
          setDepartments(res.data);
        }
      } catch {
        setError("Unable to load departments. The API endpoint may not be configured yet.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage government departments and their assignments
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {departments.length === 0 && !error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No departments found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Departments will appear here once they are configured in the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    dept.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {dept.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-800 mb-1">{dept.name}</h3>
              {dept.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{dept.description}</p>
              )}

              <div className="space-y-2 text-sm text-slate-600">
                {dept.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{dept.contactEmail}</span>
                  </div>
                )}
                {dept.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{dept.contactPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Escalation: {dept.escalationHours}h</span>
                </div>
                {dept._count && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{dept._count.complaints} complaints</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
