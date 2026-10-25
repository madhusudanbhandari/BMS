import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import api from "../../api/axios";
import {
  PAGE_SIZE,
  getItems,
  getTotal,
  getErrorMessage,
  employeeIdOf,
  employeeName,
  normalizeStatus,
  PageHeader,
  ErrorMessage,
} from "./HrUtils";

const roles = {
  1: "Organization Admin",
  2: "Platform Admin",
  3: "Employee",
  4: "Manager",
  5: "HR",
};

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Auth/organization-employees", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });

      const items = getItems(response);

      setEmployees(items);
      setTotal(getTotal(response, items));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Employees"
        description="Search and view employees, roles, and account statuses."
        action={
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
      />

      <ErrorMessage>{error}</ErrorMessage>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              size={32}
              className="mx-auto mb-3 text-slate-400"
            />
            <p className="font-semibold text-slate-900">
              No employees found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Employee ID",
                    "Name",
                    "Email",
                    "Role"
                   
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee, index) => (
                  <tr
                    key={employeeIdOf(employee) ?? index}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-600">
                      {employeeIdOf(employee) ?? "—"}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {employeeName(employee)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {employee.email ?? employee.Email ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {normalizeStatus(
                        employee.role ?? employee.Role,
                        roles
                      )}
                    </td>

                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Page {page} of {pages} · {total} employees
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}