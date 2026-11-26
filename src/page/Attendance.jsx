import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  Clock,
  UserCheck,
  CheckCircle2,
  Clock3,
  TrendingUp,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";

const Attendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState({ isDeleted: false });
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/attendance");
      setAttendanceLogs(res.data.data || []);
      if (res.data.employee) setEmployeeStatus(res.data.employee);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleClockInOut = async () => {
    try {
      setClocking(true);
      const res = await API.post("/api/attendance");
      toast.success(
        res.data.type === "CHECK_IN"
          ? "Successfully Clocked IN!"
          : "Successfully Clocked OUT!"
      );
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.error || "Clocking failed");
    } finally {
      setClocking(false);
    }
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const a = new Date(d1);
    const b = new Date(d2);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const todayLog = attendanceLogs.find((log) => isSameDay(log.date, new Date()));

  const presentCount = attendanceLogs.filter(
    (l) => l.status === "PRESENT" || l.status === "LATE"
  ).length;
  const lateCount = attendanceLogs.filter((l) => l.status === "LATE").length;
  const avgHours =
    attendanceLogs.length > 0
      ? (
          attendanceLogs.reduce((acc, c) => acc + (c.workingHours || 0), 0) /
          attendanceLogs.length
        ).toFixed(1)
      : "0";

  const filteredLogs = attendanceLogs.filter((log) =>
    statusFilter === "ALL" ? true : log.status === statusFilter
  );

  const fmtTime = (v) =>
    v
      ? new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null;

  const checkInTime = fmtTime(todayLog?.checkIn || todayLog?.checkIN);
  const checkOutTime = fmtTime(todayLog?.checkOut || todayLog?.checkOUT);

  const stats = [
    {
      label: "Total Present",
      value: presentCount,
      suffix: "Days",
      Icon: CheckCircle2,
      accent: "emerald",
    },
    {
      label: "Late Arrivals",
      value: lateCount,
      suffix: "Days",
      Icon: Clock3,
      accent: "amber",
    },
    {
      label: "Avg. Daily Hours",
      value: avgHours,
      suffix: "Hrs",
      Icon: TrendingUp,
      accent: "sky",
    },
  ];

  const accentMap = {
    emerald: { bg: "bg-emerald-400/10", text: "text-emerald-400", ring: "ring-emerald-400/10" },
    amber: { bg: "bg-amber-400/10", text: "text-amber-400", ring: "ring-amber-400/10" },
    sky: { bg: "bg-sky-400/10", text: "text-sky-400", ring: "ring-sky-400/10" },
    rose: { bg: "bg-rose-400/10", text: "text-rose-400", ring: "ring-rose-400/10" },
  };

  const statusBadge = (status) => {
    const map = {
      PRESENT: "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20",
      LATE: "bg-amber-400/10 text-amber-400 ring-amber-400/20",
    };
    return map[status] || "bg-white/[0.04] text-slate-400 ring-white/10";
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Time Tracking</span>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-white">
            Attendance
          </h1>
          <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-slate-400">
            Track your daily check-in, check-out and working hours in one place.
          </p>
        </div>

        <button
          onClick={handleClockInOut}
          disabled={clocking || employeeStatus.isDeleted}
          className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserCheck className="h-[17px] w-[17px]" />
          <span>
            {clocking
              ? "Processing..."
              : todayLog && !todayLog.checkOut
              ? "Clock Out"
              : "Clock In"}
          </span>
        </button>
      </div>

      {/* ── Deactivated Warning ── */}
      {employeeStatus.isDeleted && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3.5 text-[12.5px] font-medium text-rose-300">
          <ShieldAlert className="h-[17px] w-[17px] shrink-0 text-rose-400" />
          <span>Your account is deactivated. You cannot record attendance.</span>
        </div>
      )}

      {/* ── Today's Punch Card ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Today's Punch Status
          </h3>
          <span className="text-[11px] font-medium text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Check In
            </p>
            <p
              className={`mt-2 text-[19px] font-semibold tracking-tight ${
                checkInTime ? "text-white" : "text-slate-600"
              }`}
            >
              {checkInTime || "Not Clocked In"}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Check Out
            </p>
            <p
              className={`mt-2 text-[19px] font-semibold tracking-tight ${
                checkOutTime ? "text-white" : "text-slate-600"
              }`}
            >
              {checkOutTime || "Not Clocked Out"}
            </p>
          </div>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-amber-300/90">
              Current Status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <p className="text-[19px] font-semibold tracking-tight text-white">
                {todayLog?.status || "PENDING"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => {
          const a = accentMap[s.accent];
          const Icon = s.Icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {s.label}
                </p>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} ${a.text} ring-1 ${a.ring}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <h4 className="text-[26px] font-semibold leading-none tracking-tight text-white">
                  {s.value}
                </h4>
                <span className="text-[11.5px] font-medium text-slate-500">
                  {s.suffix}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Logs Table ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-white">
              Attendance History
            </h3>
            <p className="mt-0.5 text-[11.5px] font-normal text-slate-500">
              {filteredLogs.length} record{filteredLogs.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            {["ALL", "PRESENT", "LATE"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-[11.5px] font-medium transition-all ${
                  statusFilter === s
                    ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Loading Logs
              </p>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              <CalendarDays className="h-[18px] w-[18px] text-slate-600" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-slate-300">
                No attendance logs found
              </p>
              <p className="mt-0.5 text-[11.5px] text-slate-500">
                {statusFilter === "ALL"
                  ? "Clock in to start tracking your attendance."
                  : `No records match "${statusFilter.toLowerCase()}" filter.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 font-medium">Check In</th>
                  <th className="px-5 py-3.5 font-medium">Check Out</th>
                  <th className="px-5 py-3.5 font-medium">Hours</th>
                  <th className="px-5 py-3.5 font-medium">Day Type</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredLogs.map((log) => {
                  const ci = fmtTime(log.checkIn || log.checkIN);
                  const co = fmtTime(log.checkOut || log.checkOUT);
                  return (
                    <tr
                      key={log._id || log.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="font-medium text-white">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        {log.employee && (
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {log.employee.firstName} {log.employee.lastName || ""}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">
                        {ci || <span className="text-slate-600">--:--</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">
                        {co || <span className="text-slate-600">--:--</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {log.workingHours ? (
                          <span className="font-medium text-white">
                            {log.workingHours} hrs
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-amber-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-400">
                        {log.dayType || <span className="text-slate-600">--</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ring-1 ${statusBadge(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;