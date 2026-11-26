import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  Users,
  Building2,
  Clock,
  CalendarDays,
  CreditCard,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      toast.error(err.response?.data?.error || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleClockInOut = async () => {
    try {
      setClocking(true);
      const res = await API.post("/api/attendance");
      toast.success(res.data.message || "Clock action successful!");
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || "Clocking failed");
    } finally {
      setClocking(false);
    }
  };

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Loading Dashboard
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  const metrics = isAdmin
    ? [
        {
          label: "Total Employees",
          value: dashboardData?.totalEmployee || 0,
          hint: "Active Staff",
          hintColor: "text-emerald-400",
          Icon: Users,
          accent: "amber",
        },
        {
          label: "Departments",
          value: dashboardData?.totalDepartments || 0,
          hint: "Configured Units",
          hintColor: "text-slate-500",
          Icon: Building2,
          accent: "sky",
        },
        {
          label: "Today's Attendance",
          value: dashboardData?.todayAttendance || 0,
          hint: "Clocked-in Staff",
          hintColor: "text-slate-500",
          Icon: Clock,
          accent: "emerald",
        },
        {
          label: "Pending Leaves",
          value: dashboardData?.pendingLeaves || 0,
          hint: "Requires Review",
          hintColor: "text-rose-400",
          Icon: CalendarDays,
          accent: "rose",
        },
      ]
    : [
        {
          label: "Month Attendance",
          value: dashboardData?.currentMonthAttendance || 0,
          suffix: "Days",
          hint: "This Month",
          hintColor: "text-slate-500",
          Icon: Clock,
          accent: "amber",
        },
        {
          label: "My Pending Leaves",
          value: dashboardData?.pendingLeaves || 0,
          hint: "Awaiting Approval",
          hintColor: "text-slate-500",
          Icon: CalendarDays,
          accent: "sky",
        },
      ];

  const accentMap = {
    amber: {
      iconBg: "bg-amber-400/10",
      iconText: "text-amber-400",
      ring: "ring-amber-400/10",
    },
    sky: {
      iconBg: "bg-sky-400/10",
      iconText: "text-sky-400",
      ring: "ring-sky-400/10",
    },
    emerald: {
      iconBg: "bg-emerald-400/10",
      iconText: "text-emerald-400",
      ring: "ring-emerald-400/10",
    },
    rose: {
      iconBg: "bg-rose-400/10",
      iconText: "text-rose-400",
      ring: "ring-rose-400/10",
    },
  };

  return (
    <div className="space-y-7">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0F172A] p-7 sm:p-9">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-[110px]" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>{isAdmin ? "Administrator Portal" : "Employee Portal"}</span>
            </div>

            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
              Good day,{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>

            <p className="max-w-xl text-[13.5px] font-normal leading-relaxed text-slate-400">
              {isAdmin
                ? "Here is the summary of your organization's attendance, department stats, and pending leave requests today."
                : "Welcome back. Review your monthly attendance, pending leaves, and latest payslip."}
            </p>
          </div>

          <button
            onClick={handleClockInOut}
            disabled={clocking}
            className="group flex shrink-0 items-center gap-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserCheck className="h-[17px] w-[17px]" />
            <span>{clocking ? "Processing..." : "Clock In / Out"}</span>
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {metrics.map((m, i) => {
          const a = accentMap[m.accent];
          const Icon = m.Icon;
          return (
            <div
              key={i}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {m.label}
                </p>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText} ring-1 ${a.ring}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-[28px] font-semibold leading-none tracking-tight text-white">
                    {m.value}
                  </h3>
                  {m.suffix && (
                    <span className="text-[12px] font-medium text-slate-500">
                      {m.suffix}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${m.hintColor}`}
                >
                  {m.hint === "Active Staff" && <TrendingUp className="h-3 w-3" />}
                  {m.hint}
                </span>
              </div>
            </div>
          );
        })}

        {/* ── Latest Payslip (Employee only) ── */}
        {!isAdmin && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:col-span-2 lg:col-span-1 transition-all duration-200 hover:border-white/[0.12]">
            <div className="flex items-start justify-between">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Latest Payslip
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/10">
                <CreditCard className="h-[18px] w-[18px]" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[22px] font-semibold leading-tight tracking-tight text-white">
                {dashboardData?.latestPayslip
                  ? `$${dashboardData.latestPayslip.netSalary || dashboardData.latestPayslip.basicSalary}`
                  : "—"}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {dashboardData?.latestPayslip
                  ? `For ${dashboardData.latestPayslip.month} ${dashboardData.latestPayslip.year}`
                  : "No payslip generated yet"}
              </p>

              <Link
                to="/payslip"
                className="group mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                <span>View details</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Shortcuts ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Quick Shortcuts
          </h3>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            isAdmin && {
              to: "/employees",
              Icon: Users,
              title: "Employee Directory",
              desc: "Add, edit or deactivate team members",
            },
            {
              to: "/attendance",
              Icon: Clock,
              title: "Attendance Log",
              desc: "Review check-in history and timesheet",
            },
            {
              to: "/leave",
              Icon: CalendarDays,
              title: "Leave Portal",
              desc: "Submit requests or manage pending leaves",
            },
          ]
            .filter(Boolean)
            .map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-amber-400/30 hover:bg-white/[0.035]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/10 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:ring-amber-400">
                    <item.Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-semibold text-white">
                      {item.title}
                    </h4>
                    <p className="mt-0.5 text-[11.5px] font-normal text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-amber-400" />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;