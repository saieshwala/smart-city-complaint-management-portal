"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Shield, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface Officer {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  department?: { name: string } | null;
  authority?: { name: string } | null;
  lastLoginAt: string | null;
  _count?: { assignedComplaints: number };
}

const roleBadge: Record<string, string> = {
  SUPER_ADMIN: "bg-red-50 text-red-700",
  DISTRICT_ADMIN: "bg-purple-50 text-purple-700",
  DEPARTMENT_HEAD: "bg-blue-50 text-blue-700",
  OFFICER: "bg-slate-100 text-slate-700",
};

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await apiClient.get("/admin/officers");
        if (Array.isArray(res.data)) {
          setOfficers(res.data);
        }
      } catch {
        setError("Unable to load officers. The API endpoint may not be configured yet.");
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
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
          <h2 className="text-2xl font-bold text-slate-800">Officers</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage admin users and officers assigned to departments
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {officers.length === 0 && !error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No officers found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Officers will appear here once they are added to the system.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Officer
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Department
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Cases
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{officer.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {officer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[officer.role] || "bg-slate-100 text-slate-700"}`}>
                        {officer.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-600">
                        {officer.department?.name || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${officer.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {officer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-600">
                        {officer._count?.assignedComplaints ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
