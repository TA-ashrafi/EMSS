import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  FileText,
  Printer,
  Plus,
  X,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const PrintPayslip = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    allowances: "0",
    deductions: "0",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/payslip");
      setPayslips(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch payslips");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const res = await API.get("/api/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, [user]);

  const handleSelectEmployeeForGen = (empId) => {
    const emp = employees.find((e) => e.id === empId || e._id === empId);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
        basicSalary: emp.basicSalary || 50000,
        allowances: emp.allowances || 5000,
        deductions: emp.deductions || 2000,
      }));
    } else {
      setFormData((prev) => ({ ...prev, employeeId: empId }));
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.basicSalary) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      setSubmitting(true);
      await API.post("/api/payslip", formData);
      toast.success("Payslip generated successfully!");
      setIsGenerateModalOpen(false);
      fetchPayslips();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate payslip");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => window.print();

  const netCalc = (
    Number(formData.basicSalary || 0) +
    Number(formData.allowances || 0) -
    Number(formData.deductions || 0)
  ).toLocaleString();

  const fmtMoney = (v) => `$${Number(v || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* ────────── Non-Printable UI ────────── */}
      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <FileText className="h-3 w-3 text-amber-400" />
              <span>Payroll</span>
            </div>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">
              Payslips
            </h1>
            <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-slate-400">
              {isAdmin
                ? "Generate and review official salary payslips for all organization members."
                : "View and download your monthly compensation statements."}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (employees.length > 0) {
                  handleSelectEmployeeForGen(employees[0].id || employees[0]._id);
                }
                setIsGenerateModalOpen(true);
              }}
              className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Generate Payslip</span>
            </button>
          )}
        </div>

        {/* Table / Empty */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
              <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Loading Payslips
              </p>
            </div>
          </div>
        ) : payslips.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-[13.5px] font-medium text-slate-300">
                  No payslips issued yet
                </p>
                <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-slate-500">
                  {isAdmin
                    ? "Generate your first payslip to start building payroll records."
                    : "Your issued payslips will appear here once generated by HR."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <h3 className="text-[13px] font-semibold text-white">
                Payslip Records
              </h3>
              <span className="text-[11px] font-medium text-slate-500">
                {payslips.length} record{payslips.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    {isAdmin && <th className="px-5 py-3.5 font-medium">Employee</th>}
                    <th className="px-5 py-3.5 font-medium">Period</th>
                    <th className="px-5 py-3.5 font-medium">Basic</th>
                    <th className="px-5 py-3.5 font-medium">Allowances</th>
                    <th className="px-5 py-3.5 font-medium">Deductions</th>
                    <th className="px-5 py-3.5 font-medium">Net Pay</th>
                    <th className="px-5 py-3.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {payslips.map((item) => (
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
                                {item.employee?.department || "Staff"}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-medium text-white">
                          {MONTHS[item.month - 1]} {item.year}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">
                        {fmtMoney(item.basicSalary)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-emerald-400">
                        +{fmtMoney(item.allowances)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-rose-400">
                        -{fmtMoney(item.deductions)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-semibold text-white">
                          {fmtMoney(item.netSalary || item.basicSalary)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedPayslip(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-all hover:border-amber-400/40 hover:bg-amber-400/[0.06] hover:text-amber-300"
                        >
                          <Printer className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ────────── Payslip View / Print Modal ────────── */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm print:static print:block print:overflow-visible print:bg-white print:p-0 print:backdrop-blur-none">
          <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0F172A] shadow-2xl print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none">
            {/* Action bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] p-5 print:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                <span>Compensation Statement</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3.5 py-2 text-[11.5px] font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.98]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ⚠️ PRINTABLE DOCUMENT — forced light theme */}
            <div
              id="printable-payslip"
              className="space-y-6 bg-white p-6 text-slate-900 sm:p-10 print:p-8"
            >
              {/* Doc header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                    <Zap className="h-5 w-5 fill-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-[19px] font-bold leading-none tracking-tight text-slate-900">
                      Lemon<span className="text-amber-500">EMS</span> Inc.
                    </h2>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      100 Enterprise Way, Suite 400 · HR & Payroll Dept.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-700">
                    Payslip
                  </h3>
                  <p className="mt-0.5 text-[11.5px] font-semibold text-amber-600">
                    {MONTHS[selectedPayslip.month - 1]} {selectedPayslip.year}
                  </p>
                </div>
              </div>

              {/* Employee info */}
              <div className="grid grid-cols-2 gap-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11.5px]">
                <div>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Employee
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    {selectedPayslip.employee
                      ? `${selectedPayslip.employee.firstName} ${selectedPayslip.employee.lastName || ""}`
                      : "Staff Member"}
                  </p>
                  <p className="mt-0.5 font-medium text-slate-600">
                    {selectedPayslip.employee?.email || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Department / Role
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    {selectedPayslip.employee?.department || "General"}
                  </p>
                  <p className="mt-0.5 font-medium text-slate-600">
                    {selectedPayslip.employee?.position || "Staff"}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-amber-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 text-right font-medium">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        Basic Monthly Salary
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                        {fmtMoney(selectedPayslip.basicSalary)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        Standard Allowances (HRA, Transport)
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                        +{fmtMoney(selectedPayslip.allowances)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        Tax & Provident Deductions
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-rose-500">
                        -{fmtMoney(selectedPayslip.deductions)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-amber-50">
                    <tr>
                      <td className="px-5 py-4 text-[12.5px] font-bold text-slate-900">
                        Total Net Payout
                      </td>
                      <td className="px-5 py-4 text-right text-[15px] font-bold text-slate-950">
                        {fmtMoney(selectedPayslip.netSalary || selectedPayslip.basicSalary)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[10.5px] font-medium text-slate-500">
                <p>This is a computer-generated document. Signature is not required.</p>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified &amp; Approved
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────── Generate Payslip Modal ────────── */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F172A] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.06] p-6">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  <FileText className="h-2.5 w-2.5 text-amber-400" />
                  <span>New Payslip</span>
                </div>
                <h2 className="text-[18px] font-semibold tracking-tight text-white">
                  Generate Payslip
                </h2>
                <p className="mt-1 text-[12px] text-slate-400">
                  Create a compensation statement for a team member.
                </p>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Employee
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => handleSelectEmployeeForGen(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                >
                  {employees.map((emp) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-3">
                {[
                  { key: "basicSalary", label: "Basic ($)", required: true },
                  { key: "allowances", label: "Allowances ($)" },
                  { key: "deductions", label: "Deductions ($)" },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                      {label}
                    </label>
                    <input
                      type="number"
                      required={required}
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
                <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-amber-300/90">
                  Net Pay
                </span>
                <span className="text-[17px] font-semibold tracking-tight text-amber-300">
                  ${netCalc}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-[12.5px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-2.5 text-[12.5px] font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Generating..." : "Generate & Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintPayslip;