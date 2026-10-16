
import { useEffect, useState } from "react";
import {
  UsersRound,
  Wallet,
  Clock,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

import { getSalaryRequests } from "../../api/salaryApi";

const getRequests = (response) => {
  if (Array.isArray(response)) return response;

  return (
    response?.items ??
    response?.Items ??
    response?.requests ??
    response?.Requests ??
    response?.data?.items ??
    response?.data ??
    []
  );
};

const getTotal = (response, requests) => {
  const value =
    response?.totalCount ??
    response?.TotalCount ??
    response?.totalItems ??
    response?.TotalItems ??
    response?.totalRecords ??
    response?.TotalRecords;

  return Number.isFinite(Number(value))
    ? Number(value)
    : requests.length;
};

const getStatus = (request) =>
  String(request.status ?? request.Status ?? "").toLowerCase();

const statCards = [
  {
    title: "Total Employees",
    value: "—",
    description: "Employee directory integration pending",
    icon: UsersRound,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Salary Requests",
    key: "total",
    description: "Requests reported by the API",
    icon: Wallet,
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Pending Requests",
    key: "pending",
    description: "Awaiting HR review",
    icon: Clock,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Other Requests",
    key: "other",
    description: "Requests not marked pending",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function HROverview() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getSalaryRequests({
        page: 1,
        pageSize: 100,
      });

      const items = getRequests(response);

      if (!Array.isArray(items)) {
        throw new Error("Unexpected salary requests response.");
      }

      setRequests(items);
      setTotal(getTotal(response, items));
    } catch (err) {
      console.error("Unable to load HR salary requests:", err);
      setError(
        err.response?.data?.message ??
          "Unable to load salary requests. Check your HR access and API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pending = requests.filter((request) => {
    const status = getStatus(request);
    return status === "pending";
  }).length;

  const other = requests.filter(
    (request) => getStatus(request) !== "pending"
  ).length;

  const values = { total, pending, other };

  return (
    <main className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
          WorkSphere · Human Resources
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold">
              HR Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Manage salary requests and keep HR operations organized
              from one workspace.
            </p>
          </div>

          <button
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          HR Overview
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = card.key ? values[card.key] : card.value;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                    <Icon size={22} />
                  </div>
                  <ArrowUpRight size={18} className="text-gray-400" />
                </div>

                <p className="mt-5 text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {loading && card.key ? "—" : value}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Salary Requests
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest requests returned by the salary API.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            {loading ? "Loading…" : `${requests.length} loaded`}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading salary requests…
          </div>
        ) : requests.length === 0 && !error ? (
          <div className="p-8 text-center">
            <Wallet className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="font-medium text-gray-900">
              No salary requests found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Requests will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Request ID</th>
                  <th className="px-5 py-3 font-medium">Employee ID</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request, index) => {
                  const id =
                    request.id ?? request.Id ?? `request-${index}`;
                  const employeeId =
                    request.employeeId ??
                    request.EmployeeId ??
                    request.empId ??
                    request.EmpId ??
                    "—";
                  const status =
                    request.status ?? request.Status ?? "Unknown";

                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {request.id ?? request.Id ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {employeeId}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium capitalize text-amber-700">
                          {String(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
