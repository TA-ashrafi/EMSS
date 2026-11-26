import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Check,
  Ban,
  Filter,
  FileText,
} from "lucide-react";

const Leave = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "SICK",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const url =
        isAdmin && filterStatus !== "ALL"
          ? `/api/leave?status=${filterStatus}`
          : "/api/leave";
      const res = await API.get(url);
      setLeaves(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please complete all leave form fields");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/api/leave", formData);
      toast.success("Leave application submitted successfully!");
      setIsModalOpen(false);
      setFormData({ type: "SICK", startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await API.patch(`/api/leave/${leaveId}`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update leave status");
    }
  };

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const statusBadge = (status) => {
    const map = {
      APPROVED: "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20",
      REJECTED: "bg-rose-400/10 text-rose-400 ring-rose-400/20",
      PENDING: "bg-amber-400/10 text-amber-400 ring-amber-400/20",
    };
    return map[status] || "bg-white/[0.04] text-slate-400 ring-white/10";
  };

  const statusIcon = (status) => {
    if (status === "APPROVED") return <CheckCircle2 className="h-3 w-3" />;
    if (status === "REJECTED") return <XCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const leaveTypeBadge = (type) => {
    const map = {
      SICK: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
      CASUAL: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
      ANNUAL: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    };
    return map[type] || "bg-white/[0.04] text-slate-300 ring-white/10";
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <CalendarDays className="h-3 w-3 text-amber-400" />
            <span>{isAdmin ? "Approval Workflow" : "Leave Requests"}</span>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-white">
            Leave Management
          </h1>
          <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-slate-400">
            {isAdmin
              ? "Review and respond to employee leave applications."
              : "Apply for leave and track the approval status of your applications."}
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/30 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* ── Admin Filter Bar ── */}
      {isAdmin && (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[11.5px] font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by status</span>
          </div>
          <div className="inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-md px-3 py-1.5 text-[11.5px] font-medium transition-all ${
                  filterStatus === st
                    ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Loading Requests
            </p>
          </div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              <CalendarDays className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[13.5px] font-medium text-slate-300">
                No leave applications found
              </p>
              <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-slate-500">
                {isAdmin
                  ? "There are currently no leave applications under this status filter."
                  : "You haven't submitted any leave requests yet."}
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11.5px] font-medium text-slate-300 transition-colors hover:border-amber-400/40 hover:text-amber-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Apply for leave
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
            <h3 className="text-[13px] font-semibold text-white">
              Applications
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              {leaves.length} record{leaves.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {isAdmin && <th className="px-5 py-3.5 font-medium">Employee</th>}
                  <th className="px-5 py-3.5 font-medium">Type</th>
                  <th className="px-5 py-3.5 font-medium">Duration</th>
                  <th className="px-5 py-3.5 font-medium">Reason</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right font-medium">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {leaves.map((item) => (
                  <tr
                    key={item.id || item._id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {isAdmin && (
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-[12px] font-semibold text-slate-950">
                            {item.employee?.firstName?.charAt(0) || "E"}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {item.employee
                                ? `${item.employee.firstName} ${item.employee.lastName || ""}`
                                : "Employee"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {item.employee?.department || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ring-1 ${leaveTypeBadge(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="font-medium text-white">
                        {fmtDate(item.startDate)}
                        <span className="mx-1.5 text-slate-600">→</span>
                        {fmtDate(item.endDate)}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Applied {fmtDate(item.createdAt)}
                      </p>
                    </td>
                    <td className="max-w-[240px] px-5 py-3.5">
                      <p className="truncate text-slate-300" title={item.reason}>
                        {item.reason}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ring-1 ${statusBadge(
                          item.status
                        )}`}
                      >
                        {statusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        {item.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                handleUpdateStatus(item.id || item._id, "APPROVED")
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-400/20 transition-colors hover:bg-emerald-500/20"
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(item.id || item._id, "REJECTED")
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-medium text-rose-400 ring-1 ring-rose-400/20 transition-colors hover:bg-rose-500/20"
                            >
                              <Ban className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-600">
                            Handled
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Apply Leave Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F172A] shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-white/[0.06] p-6">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  <FileText className="h-2.5 w-2.5 text-amber-400" />
                  <span>New Request</span>
                </div>
                <h2 className="text-[18px] font-semibold tracking-tight text-white">
                  Leave Application
                </h2>
                <p className="mt-1 text-[12px] text-slate-400">
                  Provide your leave details for approval.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Leave Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                >
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                </select>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    min={tomorrowStr}
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.startDate || tomorrowStr}
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Please specify why you are taking leave..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-slate-600 outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-[12.5px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-2.5 text-[12.5px] font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;