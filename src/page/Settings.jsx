import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  ShieldCheck,
  Save,
  KeyRound,
  Palette,
  Mail,
  Briefcase,
} from "lucide-react";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [bio, setBio] = useState(profile?.bio || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile?.bio) setBio(profile.bio);
  }, [profile]);

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      await API.put("/api/profile", { bio });
      toast.success("Profile bio updated successfully!");
      refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    try {
      setUpdatingPassword(true);
      await API.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  const readOnlyInput =
    "w-full rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5 text-[12.5px] font-medium text-slate-400 outline-none cursor-not-allowed";

  const editableInput =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-slate-600 outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10";

  const fieldLabel =
    "mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-300">
          <SettingsIcon className="h-3 w-3 text-amber-400" />
          <span>Account</span>
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight text-white">
          Settings & Profile
        </h1>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-slate-400">
          Manage your account details, security credentials, and system preferences.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* ── Left Column ── */}
        <div className="space-y-5 md:col-span-1">
          {/* Profile summary card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[26px] font-semibold text-slate-950 ring-4 ring-amber-400/10">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-white">
                {displayName}
              </h3>
              <p className="mt-0.5 truncate text-[11.5px] font-medium text-slate-500">
                {user?.email}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/10">
                <ShieldCheck className="h-3 w-3" />
                {isAdmin ? "Administrator" : "Employee"}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Briefcase className="h-3 w-3" />
                  Department
                </span>
                <span className="font-medium text-slate-200">
                  {profile?.department || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <User className="h-3 w-3" />
                  Position
                </span>
                <span className="font-medium text-slate-200">
                  {profile?.position || "Staff"}
                </span>
              </div>
            </div>
          </div>

          {/* Theme card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-amber-400" />
              <h4 className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
                System Theme
              </h4>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 ring-2 ring-amber-400/20" />
                <span className="text-[12px] font-medium text-white">
                  Lemon Fresh
                </span>
              </div>
              <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-amber-300">
                Default
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5 md:col-span-2">
          {/* Profile Info Form */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.06] p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/10">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Profile Information
                  </h2>
                  <p className="mt-0.5 text-[11.5px] font-normal text-slate-500">
                    Some details are managed by your administrator.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateBio} className="space-y-4 p-6">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>First Name</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.firstName || "ADMIN"}
                    className={readOnlyInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Last Name</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.lastName || ""}
                    className={readOnlyInput}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className={`${readOnlyInput} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>About / Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about your role and responsibilities..."
                  className={`${editableInput} resize-none`}
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-2.5 text-[12.5px] font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{updatingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.06] p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/10">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-white">
                    Security & Password
                  </h2>
                  <p className="mt-0.5 text-[11.5px] font-normal text-slate-500">
                    Use a strong, unique password to protect your account.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 p-6">
              <div>
                <label className={fieldLabel}>Current Password</label>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400" />
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className={`${editableInput} pl-10`}
                  />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>New Password</label>
                  <div className="relative group">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400" />
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className={`${editableInput} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={fieldLabel}>Confirm New Password</label>
                  <div className="relative group">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400" />
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className={`${editableInput} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5 text-[11.5px] font-normal leading-relaxed text-slate-500">
                Password must be at least 6 characters long and different from your current password.
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-[12.5px] font-semibold text-white transition-all hover:border-amber-400/40 hover:bg-amber-400/[0.06] hover:text-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>
                    {updatingPassword ? "Updating..." : "Update Password"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;