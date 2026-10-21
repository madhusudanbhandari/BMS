
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";
import { getOrganizationEmployees } from "../../api/managerApi";
import {
  field,
  listFromResponse,
  errorMessage,
  StatusBadge,
} from "./managerUtils";

function roleLabel(value) {
  const roles = {
    1: "Organization Admin",
    2: "Platform Admin",
    3: "Employee",
    4: "Manager",
    5: "HR",
  };

  return roles[value] ?? String(value ?? "Unknown");
}

function employeeStatus(value) {
  const statuses = {
    1: "Pending",
    2: "Approved",
    3: "Rejected",
  };

  return statuses[value] ?? String(value ?? "Unknown");
}

export default function ManagerEmployees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getOrganizationEmployees();
      setEmployees(listFromResponse(response));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredEmployees = employees.filter((employee) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      field(employee, "name", "Name", "fullName", "FullName"),
      field(employee, "email", "Email"),
      field(employee, "role", "Role", "userRole", "UserRole"),
      field(employee, "status", "Status", "userStatus", "UserStatus"),
    ].some((value) => String(value ?? "").toLowerCase().includes(query));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            View employee details, roles, and account statuses in your organization.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Employees returned</p>
            <Users className="text-indigo-600" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{employees.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending accounts</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {employees.filter((employee) => {
              const value = field(employee, "status", "Status", "userStatus", "UserStatus");
              return String(value).toLowerCase() === "pending" || Number(value) === 1;
            }).length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">Organization employees</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredEmployees.length} employee(s) displayed
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <RefreshCw className="animate-spin" size={18} /> Loading employees...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No matching employees found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Employee</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Employee ID</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee, index) => {
                  const id = field(employee, "id", "Id", "userId", "UserId");
                  const name = field(employee, "name", "Name", "fullName", "FullName");
                  const email = field(employee, "email", "Email");
                  const role = field(employee, "role", "Role", "userRole", "UserRole");
                  const status = field(employee, "status", "Status", "userStatus", "UserStatus");

                  return (
                    <tr key={id ?? email ?? index} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {name ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{email ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{roleLabel(role)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge value={employeeStatus(status)} />
                      </td>
                      <td className="px-5 py-4 text-slate-500">{id ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
