"use client";

import { useState, useEffect } from "react";
import { Settings, User, Lock, Bell, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("civicconnect_admin_user") || "null");
        setAdminUser(user);
      } catch {
        // ignore
      }
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    // Password change API not yet implemented
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: "info", text: "Password change API is not yet available." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Profile</h3>
            <p className="text-xs text-slate-500">Your account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={adminUser?.name || adminUser?.fullName || ""}
              readOnly
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={adminUser?.email || ""}
              readOnly
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <input
              type="text"
              value={adminUser?.role?.replace(/_/g, " ") || ""}
              readOnly
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Change Password</h3>
            <p className="text-xs text-slate-500">Update your login credentials</p>
          </div>
        </div>

        {message.text && (
          <div
            className={`px-4 py-3 rounded-lg text-sm mb-4 ${
              message.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Notifications</h3>
            <p className="text-xs text-slate-500">Configure notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-700">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive email alerts for new complaints</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-700">SLA Breach Alerts</p>
              <p className="text-xs text-slate-500">Get notified when SLA deadlines are approaching</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-700">Status Updates</p>
              <p className="text-xs text-slate-500">Notifications when complaint statuses change</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
          </label>
        </div>
      </div>
    </div>
  );
}
