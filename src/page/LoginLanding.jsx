import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, Lock, ShieldCheck, UserCheck, ArrowRight, Sparkles } from "lucide-react";

const LoginLanding = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState("admin");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setSubmitting(true);
      await login(email, password, roleType);
      toast.success(`Welcome back! Logged in as ${roleType}`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.error || "Invalid login credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B1120] font-sans text-slate-100 antialiased">
      {/* ── Left Brand Panel ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0F172A] p-12 lg:flex xl:p-16">
        {/* Subtle grid + glow */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[120px]" />
        <div className="absolute -bottom-24 right-0 h-[360px] w-[360px] rounded-full bg-yellow-300/10 blur-[100px]" />

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-4">
          <img
            src="/assets/logo.png"
            alt="Lemon Media Logo"
            className="h-14 w-14 rounded-xl border border-white/10 object-cover shadow-lg shadow-black/40"
          />
          <div>
            <span className="block text-[22px] font-semibold tracking-tight text-white leading-none">
              Lemon Media
            </span>
            <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-amber-400/90">
              Company EMS
            </span>
          </div>
        </div>

        {/* Value proposition */}
        <div className="relative z-10 max-w-md space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-slate-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Official Workforce & Payroll System</span>
          </div>

          <h1 className="text-[38px] font-semibold leading-[1.15] tracking-tight text-white xl:text-[44px]">
            Manage your team with{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              clarity & confidence.
            </span>
          </h1>

          <p className="max-w-sm text-[15px] font-normal leading-relaxed text-slate-400">
            Track attendance, process payroll, and approve leave requests in one unified
            workspace built for Lemon Media Company.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure Auth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Role-Based Access
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Encrypted Data
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-6 text-[11px] font-medium tracking-wide text-slate-500">
          <span>© {new Date().getFullYear()} Lemon Media Company</span>
          <span className="text-slate-600">Enterprise Portal v2.0</span>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="relative flex w-full items-center justify-center bg-[#0B1120] p-6 sm:p-10 lg:w-1/2">
        {/* Mobile top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent lg:hidden" />

        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 lg:hidden">
            <img
              src="/assets/logo.png"
              alt="Lemon Media Logo"
              className="h-11 w-11 rounded-xl border border-white/10 object-cover"
            />
            <div>
              <span className="block text-[17px] font-semibold tracking-tight text-white leading-none">
                Lemon Media
              </span>
              <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-amber-400/90">
                Company EMS
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
              Sign in to your account
            </h2>
            <p className="text-[13.5px] leading-relaxed text-slate-400">
              Choose your role and enter your credentials to access the workspace.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5">
            {[
              { key: "admin", label: "Admin", Icon: ShieldCheck },
              { key: "employee", label: "Employee", Icon: UserCheck },
            ].map(({ key, label, Icon }) => {
              const active = roleType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoleType(key)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12.5px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className="h-[15px] w-[15px]" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleType === "admin" ? "admin@gmail.com" : "employee@lemonmedia.com"}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-11 pr-4 text-[13.5px] text-white placeholder-slate-600 outline-none transition-all duration-200 focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-slate-500 transition-colors hover:text-amber-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-11 pr-4 text-[13.5px] text-white placeholder-slate-600 outline-none transition-all duration-200 focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 py-3 text-[13.5px] font-semibold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {submitting
                  ? "Signing in..."
                  : `Continue as ${roleType === "admin" ? "Admin" : "Employee"}`}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Divider + footer */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
                Authorized Personnel Only
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <p className="text-center text-[11px] font-medium leading-relaxed text-slate-600">
              © {new Date().getFullYear()} Lemon Media Company. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;