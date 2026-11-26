import React, { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  Mail,
  Phone,
  X,
  LayoutGrid,
  List,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";

const DEPARTMENTS = [
  "All", "Engineering", "Human Resources", "Marketing", "Sales",
  "Finance", "Operations", "IT Support", "Customer Service",
  "Product Management", "Design",
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState("cards");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", position: "",
    department: "Engineering", basicSalary: "", allowances: "", deductions: "",
    joinDate: new Date().toISOString().split("T")[0], password: "",
    role: "EMPLOYEE", bio: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const url = selectedDepartment === "All"
        ? "/api/employees"
        : `/api/employees?department=${encodeURIComponent(selectedDepartment)}`;
      const res = await API.get(url);
      setEmployees(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [selectedDepartment]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: "", lastName: "", email: "", phone: "", position: "",
      department: "Engineering", basicSalary: "50000", allowances: "5000",
      deductions: "2000", joinDate: new Date().toISOString().split("T")[0],
      password: "", role: "EMPLOYEE", bio: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName || "", lastName: emp.lastName || "",
      email: emp.email || "", phone: emp.phone || "",
      position: emp.position || "", department: emp.department || "Engineering",
      basicSalary: emp.basicSalary || "", allowances: emp.allowances || "",
      deductions: emp.deductions || "",
      joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split("T")[0] : "",
      password: "", role: emp.userId?.role || "EMPLOYEE", bio: emp.bio || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingEmployee) {
        await API.put(`/api/employees/${editingEmployee.id}`, formData);
        toast.success("Employee updated successfully");
      } else {
        await API.post("/api/employees", formData);
        toast.success("Employee created successfully");
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      await API.delete(`/api/employees/${empId}`);
      toast.success("Employee deactivated");
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete employee");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      (emp.email || "").toLowerCase().includes(q) ||
      (emp.position || "").toLowerCase().includes(q)
    );
  });

  const fieldLabel =
    "mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500";
  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-slate-600 outline-none transition-all focus:border-amber-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/10 [color-scheme:dark]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <Users className="h-3 w-3 text-amber-400" />
            <span>Team Directory</span>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-white">
            Employees
          </h1>
          <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-slate-400">
            Manage team members, roles, and compensation details.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-3 text-[13px] font-semibold tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or title..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.015] py-2.5 pl-10 pr-4 text-[12.5px] text-white placeholder-slate-600 outline-none transition-all focus:border-amber-400/50 focus:bg-white/[0.03]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-slate-500" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] py-2.5 pl-9 pr-8 text-[12.5px] font-medium text-white outline-none focus:border-amber-400/50"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
              ))}
            </select>
          </div>

          <div className="inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-amber-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-all ${
                viewMode === "table"
                  ? "bg-amber-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[13.5px] font-medium text-slate-300">No employees found</p>
              <p className="mt-1 text-[11.5px] text-slate-500">
                Try adjusting your search or filter.
              </p>
            </div>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* ═════════ Cards View — Clean Edition ═════════ */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.map((emp) => {
            const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase();
            return (
              <div
                key={emp.id}
                className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-[#0F172A] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111B30]"
              >
                {/* Top row: avatar + status */}
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-[15px] font-semibold text-slate-950 shadow-inner">
                    {initials || "E"}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9.5px] font-medium uppercase tracking-wider ${
                      emp.isDeleted
                        ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
                        : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${
                        emp.isDeleted ? "bg-rose-400" : "bg-emerald-400"
                      }`}
                    />
                    {emp.isDeleted ? "Inactive" : "Active"}
                  </div>
                </div>

                {/* Name + role */}
                <div className="mt-4">
                  <h3 className="truncate text-[15px] font-semibold text-white">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="mt-0.5 truncate text-[12px] font-medium text-slate-400">
                    {emp.position || "Team Member"}
                  </p>
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-white/[0.06]" />

                {/* Contact info */}
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Users className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    <span className="truncate">{emp.department || "—"}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                      <span className="truncate">{emp.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer: salary + actions */}
                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div>
                    <p className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-slate-600">
                      Salary
                    </p>
                    <p className="mt-0.5 text-[14px] font-semibold text-white">
                      ${emp.basicSalary?.toLocaleString() || 0}
                      <span className="ml-0.5 text-[10.5px] font-normal text-slate-500">
                        /mo
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-amber-300"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      title="Deactivate"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                      title="View details"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═════════ Table View ═════════ */
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-5 py-3.5 font-medium">Employee</th>
                  <th className="px-5 py-3.5 font-medium">Department</th>
                  <th className="px-5 py-3.5 font-medium">Contact</th>
                  <th className="px-5 py-3.5 font-medium">Salary</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredEmployees.map((emp) => {
                  const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <tr key={emp.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-[11.5px] font-semibold text-slate-950">
                            {initials || "E"}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {emp.position || "Employee"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">
                        {emp.department}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="space-y-0.5 text-[11.5px]">
                          <p className="text-slate-300">{emp.email}</p>
                          {emp.phone && <p className="text-slate-500">{emp.phone}</p>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="font-medium text-white">
                          ${emp.basicSalary?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ${
                            emp.isDeleted
                              ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
                              : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${
                              emp.isDeleted ? "bg-rose-400" : "bg-emerald-400"
                            }`}
                          />
                          {emp.isDeleted ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-amber-300"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                            title="Deactivate"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal — same as before (unchanged structure) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F172A] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.06] p-6">
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight text-white">
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h2>
                <p className="mt-1 text-[12px] text-slate-400">
                  {editingEmployee
                    ? "Update team member details and compensation."
                    : "Create a new team member account."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>First Name *</label>
                  <input type="text" required value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>Last Name *</label>
                  <input type="text" required value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Email *</label>
                  <input type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>Phone</label>
                  <input type="text" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Department</label>
                  <select value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={inputClass}>
                    {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Position</label>
                  <input type="text" value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Senior Video Editor"
                    className={inputClass} />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-3">
                <div>
                  <label className={fieldLabel}>Basic ($)</label>
                  <input type="number" value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>Allowances ($)</label>
                  <input type="number" value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>Deductions ($)</label>
                  <input type="number" value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className={inputClass} />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Join Date</label>
                  <input type="date" value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabel}>System Role</label>
                  <select value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={inputClass}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>
                  {editingEmployee ? "New Password (optional)" : "Password *"}
                </label>
                <input type="password" required={!editingEmployee}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={inputClass} />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-[12.5px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-5 py-2.5 text-[12.5px] font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] disabled:opacity-60">
                  {submitting ? "Saving..." : editingEmployee ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;