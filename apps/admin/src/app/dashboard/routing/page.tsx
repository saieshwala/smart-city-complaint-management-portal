"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Building2,
  ChevronDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

// --- Types ---

interface RoutingRule {
  id: string;
  category: string | { id: string; name: string; [key: string]: any };
  department: string | { id: string; name: string; [key: string]: any };
  priority: string;
  autoAssign?: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SlaRule {
  id: string;
  priority: string;
  responseTimeHours: number;
  resolutionTimeDays: number;
  escalationAfterHours: number;
  isActive: boolean;
}

// --- Mock data ---

const mockRoutingRules: RoutingRule[] = [
  {
    id: "RULE-001",
    category: "Roads & Infrastructure",
    department: "Public Works Department",
    priority: "High",
    autoAssign: true,
    isActive: true,
    createdAt: "2024-06-15",
  },
  {
    id: "RULE-002",
    category: "Water Supply",
    department: "Water & Sewerage Board",
    priority: "High",
    autoAssign: true,
    isActive: true,
    createdAt: "2024-06-15",
  },
  {
    id: "RULE-003",
    category: "Electricity",
    department: "Electricity Board",
    priority: "Medium",
    autoAssign: true,
    isActive: true,
    createdAt: "2024-06-20",
  },
  {
    id: "RULE-004",
    category: "Sanitation",
    department: "Health & Sanitation Dept",
    priority: "Medium",
    autoAssign: false,
    isActive: true,
    createdAt: "2024-07-01",
  },
  {
    id: "RULE-005",
    category: "Parks & Recreation",
    department: "Horticulture Department",
    priority: "Low",
    autoAssign: false,
    isActive: true,
    createdAt: "2024-07-10",
  },
  {
    id: "RULE-006",
    category: "Public Transport",
    department: "Transport Authority",
    priority: "Medium",
    autoAssign: true,
    isActive: true,
    createdAt: "2024-07-15",
  },
  {
    id: "RULE-007",
    category: "Noise Pollution",
    department: "Environment Department",
    priority: "Low",
    autoAssign: false,
    isActive: false,
    createdAt: "2024-08-01",
  },
];

const mockSlaRules: SlaRule[] = [
  {
    id: "SLA-001",
    priority: "Critical",
    responseTimeHours: 2,
    resolutionTimeDays: 1,
    escalationAfterHours: 4,
    isActive: true,
  },
  {
    id: "SLA-002",
    priority: "High",
    responseTimeHours: 8,
    resolutionTimeDays: 3,
    escalationAfterHours: 24,
    isActive: true,
  },
  {
    id: "SLA-003",
    priority: "Medium",
    responseTimeHours: 24,
    resolutionTimeDays: 7,
    escalationAfterHours: 72,
    isActive: true,
  },
  {
    id: "SLA-004",
    priority: "Low",
    responseTimeHours: 48,
    resolutionTimeDays: 14,
    escalationAfterHours: 168,
    isActive: true,
  },
];

const priorityColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const categoryOptions = [
  "Roads & Infrastructure",
  "Water Supply",
  "Electricity",
  "Sanitation",
  "Parks & Recreation",
  "Public Transport",
  "Noise Pollution",
  "Other",
];

const departmentOptions = [
  "Public Works Department",
  "Water & Sewerage Board",
  "Electricity Board",
  "Health & Sanitation Dept",
  "Horticulture Department",
  "Transport Authority",
  "Environment Department",
  "General Administration",
];

const priorityOptions = ["Critical", "High", "Medium", "Low"];

export default function RoutingPage() {
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(mockRoutingRules);
  const [slaRules, setSlaRules] = useState<SlaRule[]>(mockSlaRules);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"routing" | "sla">("routing");

  // Routing rule form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    category: "",
    department: "",
    priority: "Medium",
    autoAssign: false,
  });

  // SLA rule form
  const [showSlaForm, setShowSlaForm] = useState(false);
  const [editingSla, setEditingSla] = useState<SlaRule | null>(null);
  const [slaForm, setSlaForm] = useState({
    priority: "Medium",
    responseTimeHours: 24,
    resolutionTimeDays: 7,
    escalationAfterHours: 72,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, slaRes] = await Promise.allSettled([
        apiClient.get("/routing/rules"),
        apiClient.get("/routing/sla"),
      ]);
      if (rulesRes.status === "fulfilled") {
        const rules = rulesRes.value.data;
        if (Array.isArray(rules)) setRoutingRules(rules);
      }
      if (slaRes.status === "fulfilled") {
        const sla = slaRes.value.data;
        if (Array.isArray(sla)) setSlaRules(sla);
      }
    } catch {
      // Keep mock data on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Routing rule CRUD ---

  const openCreateRule = () => {
    setEditingRule(null);
    setRuleForm({ category: "", department: "", priority: "Medium", autoAssign: false });
    setShowRuleForm(true);
  };

  const openEditRule = (rule: RoutingRule) => {
    setEditingRule(rule);
    setRuleForm({
      category: typeof rule.category === "object" ? rule.category.name : rule.category,
      department: typeof rule.department === "object" ? rule.department.name : rule.department,
      priority: rule.priority,
      autoAssign: rule.autoAssign ?? false,
    });
    setShowRuleForm(true);
  };

  const handleSaveRule = async () => {
    try {
      if (editingRule) {
        await apiClient.put(`/routing/rules/${editingRule.id}`, ruleForm);
        setRoutingRules((prev) =>
          prev.map((r) =>
            r.id === editingRule.id ? { ...r, ...ruleForm } : r
          )
        );
      } else {
        const res = await apiClient.post("/routing/rules", ruleForm);
        const newRule: RoutingRule = res.data || {
          id: `RULE-${String(routingRules.length + 1).padStart(3, "0")}`,
          ...ruleForm,
          isActive: true,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setRoutingRules((prev) => [...prev, newRule]);
      }
    } catch {
      // Optimistic update with mock data
      if (editingRule) {
        setRoutingRules((prev) =>
          prev.map((r) =>
            r.id === editingRule.id ? { ...r, ...ruleForm } : r
          )
        );
      } else {
        const newRule: RoutingRule = {
          id: `RULE-${String(routingRules.length + 1).padStart(3, "0")}`,
          ...ruleForm,
          isActive: true,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setRoutingRules((prev) => [...prev, newRule]);
      }
    }
    setShowRuleForm(false);
    setEditingRule(null);
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await apiClient.delete(`/routing/rules/${id}`);
    } catch {
      // Optimistic delete
    }
    setRoutingRules((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleRule = async (rule: RoutingRule) => {
    try {
      await apiClient.patch(`/routing/rules/${rule.id}`, {
        isActive: !rule.isActive,
      });
    } catch {
      // Optimistic toggle
    }
    setRoutingRules((prev) =>
      prev.map((r) =>
        r.id === rule.id ? { ...r, isActive: !r.isActive } : r
      )
    );
  };

  // --- SLA rule CRUD ---

  const openEditSla = (sla: SlaRule) => {
    setEditingSla(sla);
    setSlaForm({
      priority: sla.priority,
      responseTimeHours: sla.responseTimeHours,
      resolutionTimeDays: sla.resolutionTimeDays,
      escalationAfterHours: sla.escalationAfterHours,
    });
    setShowSlaForm(true);
  };

  const handleSaveSla = async () => {
    try {
      if (editingSla) {
        await apiClient.put(`/routing/sla/${editingSla.id}`, slaForm);
      }
    } catch {
      // Optimistic update
    }
    if (editingSla) {
      setSlaRules((prev) =>
        prev.map((s) =>
          s.id === editingSla.id ? { ...s, ...slaForm } : s
        )
      );
    }
    setShowSlaForm(false);
    setEditingSla(null);
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Routing Rules</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure complaint routing and SLA policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("routing")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === "routing"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          )}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Routing Rules
          </div>
        </button>
        <button
          onClick={() => setActiveTab("sla")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === "sla"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            SLA Rules
          </div>
        </button>
      </div>

      {/* Routing Rules Tab */}
      {activeTab === "routing" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                Category Routing ({routingRules.length} rules)
              </h3>
            </div>
            <button
              onClick={openCreateRule}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Loading rules...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Department
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Priority
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Auto-Assign
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routingRules.map((rule) => (
                    <tr
                      key={rule.id}
                      className={cn(
                        "hover:bg-slate-50 transition-colors",
                        !rule.isActive && "opacity-60"
                      )}
                    >
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-slate-700">
                          {typeof rule.category === "object" ? rule.category.name : rule.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700">
                            {typeof rule.department === "object" ? rule.department.name : rule.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            priorityColors[rule.priority]
                          )}
                        >
                          {rule.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            rule.autoAssign
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {rule.autoAssign ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                            rule.isActive ? "bg-primary-600" : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              rule.isActive ? "translate-x-4.5" : "translate-x-0.5"
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditRule(rule)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit rule"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {deleteConfirm === rule.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Confirm delete"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(rule.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SLA Rules Tab */}
      {activeTab === "sla" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                SLA Configuration
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Loading SLA rules...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Priority Level
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Response Time
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Resolution Time
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Escalation After
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slaRules.map((sla) => (
                    <tr
                      key={sla.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            priorityColors[sla.priority]
                          )}
                        >
                          {sla.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {sla.responseTimeHours} hours
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-700">
                          {sla.resolutionTimeDays} days
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm text-slate-700">
                            {sla.escalationAfterHours} hours
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            sla.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {sla.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openEditSla(sla)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit SLA rule"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SLA Info */}
          <div className="px-5 py-4 border-t border-slate-200 bg-amber-50 rounded-b-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  SLA Policy Information
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  SLA rules define the expected response and resolution times for
                  each priority level. Complaints exceeding these thresholds will be
                  automatically escalated to supervisors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routing Rule Form Modal */}
      {showRuleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingRule ? "Edit Routing Rule" : "Create Routing Rule"}
              </h3>
              <button
                onClick={() => {
                  setShowRuleForm(false);
                  setEditingRule(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={ruleForm.category}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="">Select category...</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={ruleForm.department}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, department: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="">Select department...</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Default Priority
                </label>
                <select
                  value={ruleForm.priority}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setRuleForm({ ...ruleForm, autoAssign: !ruleForm.autoAssign })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    ruleForm.autoAssign ? "bg-primary-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                      ruleForm.autoAssign
                        ? "translate-x-4.5"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
                <label className="text-sm text-slate-700">
                  Auto-assign to department officers
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRuleForm(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                disabled={!ruleForm.category || !ruleForm.department}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingRule ? "Save Changes" : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLA Rule Form Modal */}
      {showSlaForm && editingSla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Edit SLA Rule - {editingSla.priority}
              </h3>
              <button
                onClick={() => {
                  setShowSlaForm(false);
                  setEditingSla(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Response Time (hours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={slaForm.responseTimeHours}
                  onChange={(e) =>
                    setSlaForm({
                      ...slaForm,
                      responseTimeHours: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Resolution Time (days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={slaForm.resolutionTimeDays}
                  onChange={(e) =>
                    setSlaForm({
                      ...slaForm,
                      resolutionTimeDays: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Escalation After (hours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={slaForm.escalationAfterHours}
                  onChange={(e) =>
                    setSlaForm({
                      ...slaForm,
                      escalationAfterHours: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSlaForm(false);
                  setEditingSla(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSla}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
