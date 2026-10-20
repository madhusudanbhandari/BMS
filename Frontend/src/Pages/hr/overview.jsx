
import { useCallback, useEffect, useState } from "react";
import {
  UsersRound,
  Wallet,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  UserRound,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

const PAGE_SIZE = 10;

const unwrap = (response) => response?.data ?? response;

const getRequests = (response) => {
  const data = unwrap(response);

  if (Array.isArray(data)) return data;

  const items =
    data?.items ??
    data?.Items ??
    data?.requests ??
    data?.Requests ??
    data?.data?.items ??
    data?.data?.Items;

  return Array.isArray(items) ? items : [];
};

const getTotal = (response, items) => {
  const data = unwrap(response);

  const value =
    data?.totalCount ??
    data?.TotalCount ??
    data?.totalItems ??
    data?.TotalItems ??
    data?.totalRecords ??
    data?.TotalRecords;

  return Number.isFinite(Number(value)) && value != null
    ? Number(value)
    : items.length;
};

const getStatus = (request) =>
  String(
    request.salaryStatus ??
      request.SalaryStatus ??
      request.status ??
      request.Status ??
      "Unknown"
  );

const getRequestId = (request) => request.id ?? request.Id;

const getEmployeeId = (request) =>
  request.userId ??
  request.UserId ??
  request.employeeId ??
  request.EmployeeId;

const getAmount = (request) =>
  request.amount ?? request.Amount;

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.title ??
  err.message ??
  "Something went wrong.";

const formatMoney = (amount) => {
  if (amount == null || amount === "") return "—";

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

const getStatusStyle = (status) => {
  switch (String(status).toLowerCase()) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "approved":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "released":
      return "bg-indigo-50 text-indigo-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const statCards = [
  {
    title: "Employees",
    key: "employees",
    description: "Employees in your organization",
    icon: UsersRound,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Salary Requests",
    key: "total",
    description: "Requests matching the current filter",
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
    title: "Processed Requests",
    key: "processed",
    description: "Approved, rejected or released",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function HROverview() {
  const [tab, setTab] = useState("overview");

  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [processedTotal, setProcessedTotal] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeePage, setEmployeePage] = useState(1);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState("");
  const [employeeError, setEmployeeError] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("Approved");
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        pageSize: PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      };

      const response = await api.get(
        "/Salary/view-all-requests",
        { params }
      );

      const items = getRequests(response);
      setRequests(items);
      setTotal(getTotal(response, items));
    } catch (err) {
      console.error("Unable to load salary requests:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const [pendingResponse, approvedResponse, rejectedResponse, releasedResponse] =
        await Promise.all([
          api.get("/Salary/view-all-requests", {
            params: { page: 1, pageSize: 1, status: "Pending" },
          }),
          api.get("/Salary/view-all-requests", {
            params: { page: 1, pageSize: 1, status: "Approved" },
          }),
          api.get("/Salary/view-all-requests", {
            params: { page: 1, pageSize: 1, status: "Rejected" },
          }),
          api.get("/Salary/view-all-requests", {
            params: { page: 1, pageSize: 1, status: "Released" },
          }),
        ]);

      setPendingTotal(getTotal(pendingResponse, getRequests(pendingResponse)));

      setProcessedTotal(
        getTotal(approvedResponse, getRequests(approvedResponse)) +
          getTotal(rejectedResponse, getRequests(rejectedResponse)) +
          getTotal(releasedResponse, getRequests(releasedResponse))
      );
    } catch (err) {
      console.warn("Unable to load complete salary summary:", err);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeeError("");

    try {
      const response = await api.get(
        "/Auth/organization-employees",
        {
          params: {
            page: employeePage,
            pageSize: PAGE_SIZE,
            ...(employeeSearch.trim()
              ? { search: employeeSearch.trim() }
              : {}),
          },
        }
      );

      const items = getRequests(response);
      setEmployees(items);
      setEmployeeTotal(getTotal(response, items));
    } catch (err) {
      console.error("Unable to load organization employees:", err);
      setEmployeeError(
        getErrorMessage(err) +
          " The organization employee endpoint may not be implemented yet."
      );
    } finally {
      setEmployeesLoading(false);
    }
  }, [employeePage, employeeSearch]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (tab === "employees") {
      loadEmployees();
    }
  }, [tab, loadEmployees]);

  const openReview = (request) => {
    setSelectedRequest(request);
    setNewStatus(getStatus(request));
    setRejectionReason(
      request.rejectionReason ?? request.RejectionReason ?? ""
    );
    setActionError("");
  };

  const saveReview = async (event) => {
    event.preventDefault();

    if (!selectedRequest) return;

    const salaryId = getRequestId(selectedRequest);
    const employeeId = getEmployeeId(selectedRequest);

    if (salaryId == null || employeeId == null) {
      setActionError("The request is missing its salary ID or employee ID.");
      return;
    }

    if (
      newStatus.toLowerCase() === "rejected" &&
      !rejectionReason.trim()
    ) {
      setActionError("Please provide a reason for rejecting this request.");
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      await api.patch(
        "/Salary/update-salary",
        {
          salaryStatus: newStatus,
          rejectionReason:
            newStatus.toLowerCase() === "rejected"
              ? rejectionReason.trim()
              : null,
        },
        {
          params: { empId: employeeId, salaryId },
        }
      );

      setSelectedRequest(null);
      setNotice("Salary request updated successfully.");
      await Promise.all([loadRequests(), loadSummary()]);
    } catch (err) {
      console.error("Unable to update salary request:", err);
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const visibleRequests = requests.filter((request) => {
    const employeeId = String(getEmployeeId(request) ?? "");
    const requestId = String(getRequestId(request) ?? "");
    const query = search.trim().toLowerCase();

    return (
      !query ||
      employeeId.toLowerCase().includes(query) ||
      requestId.toLowerCase().includes(query)
    );
  });

  const stats = {
    employees: employeeTotal,
    total,
    pending: pendingTotal,
    processed: processedTotal,
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const employeePages = Math.max(
    1,
    Math.ceil(employeeTotal / PAGE_SIZE)
  );

  const refreshAll = async () => {
    setNotice("");
    await Promise.all([loadRequests(), loadSummary()]);

    if (tab === "employees") {
      await loadEmployees();
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
          WorkSphere · Human Resources
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold">HR Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              Review salary requests and manage employees in your organization.
            </p>
          </div>

          <button
            onClick={refreshAll}
            disabled={loading || employeesLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {notice && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <nav className="flex gap-2 border-b border-gray-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "employees", label: "Employees" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${
              tab === item.id
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
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

                return (
                  <div
                    key={card.key}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}
                    >
                      <Icon size={22} />
                    </div>
                    <p className="mt-5 text-sm font-medium text-gray-500">
                      {card.title}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {loading && card.key !== "employees"
                        ? "—"
                        : stats[card.key]}
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
            <div className="space-y-4 border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Salary Requests
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review and update salary request statuses.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search request ID or employee ID"
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Released">Released</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-gray-500">
                Loading salary requests…
              </div>
            ) : visibleRequests.length === 0 ? (
              <div className="p-10 text-center">
                <Wallet className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="font-medium text-gray-900">
                  No salary requests found
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Try changing the search or status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Request ID</th>
                      <th className="px-5 py-3 font-medium">Employee ID</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Duration</th>
                      <th className="px-5 py-3 font-medium">Requested</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visibleRequests.map((request, index) => {
                      const id = getRequestId(request) ?? index;
                      const status = getStatus(request);

                      return (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 font-medium text-gray-900">
                            {getRequestId(request) ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {getEmployeeId(request) ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-700">
                            {formatMoney(getAmount(request))}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {request.duration ?? request.Duration ?? "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {(() => {
                              const date =
                                request.requestedAt ??
                                request.RequestedAt;

                              return date
                                ? new Date(date).toLocaleDateString()
                                : "—";
                            })()}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(status)}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => openReview(request)}
                              className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {total} requests
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "employees" && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-gray-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Organization Employees
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Browse employees in your organization.
              </p>
            </div>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={employeeSearch}
                onChange={(event) => {
                  setEmployeeSearch(event.target.value);
                  setEmployeePage(1);
                }}
                placeholder="Search employees by name or email"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {employeeError && (
            <div
              role="alert"
              className="m-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              {employeeError}
            </div>
          )}

          {employeesLoading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading employees…
            </div>
          ) : employees.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="font-medium text-gray-900">
                No employees to display
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Check that the organization employee endpoint is implemented.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Employee ID</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((employee, index) => (
                    <tr
                      key={
                        employee.id ??
                        employee.Id ??
                        employee.userId ??
                        index
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        {employee.id ??
                          employee.Id ??
                          employee.userId ??
                          employee.UserId ??
                          "—"}
                      </td>
                      
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {(
                            employee.fullName ??
                            employee.FullName ??
                            employee.name ??
                            employee.Name ??
                            [employee.firstName, employee.lastName]
                              .filter(Boolean)
                              .join(" ")
                          ) || "—"}
                        </td>

                      <td className="px-5 py-4 text-gray-600">
                        {employee.email ?? employee.Email ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {String(employee.role ?? employee.Role ?? "—")}
                      </td>
                      <td className="px-5 py-4">
                        {String(
                          employee.status ?? employee.Status ?? "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">
              Page {employeePage} of {employeePages} · {employeeTotal} employees
            </p>
            <div className="flex gap-2">
              <button
                disabled={employeePage <= 1 || employeesLoading}
                onClick={() =>
                  setEmployeePage((current) => current - 1)
                }
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
                aria-label="Previous employee page"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={
                  employeePage >= employeePages || employeesLoading
                }
                onClick={() =>
                  setEmployeePage((current) => current + 1)
                }
                className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
                aria-label="Next employee page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveReview}
            className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Review Salary Request
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Request #{getRequestId(selectedRequest)} · Employee #
                  {getEmployeeId(selectedRequest)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close review"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Requested amount</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatMoney(getAmount(selectedRequest))}
              </p>
            </div>

            <div>
              <label
                htmlFor="salaryStatus"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Decision
              </label>
              <select
                id="salaryStatus"
                value={newStatus}
                onChange={(event) => setNewStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Released">Released</option>
              </select>
            </div>

            {newStatus.toLowerCase() === "rejected" && (
              <div>
                <label
                  htmlFor="rejectionReason"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Rejection reason
                </label>
                <textarea
                  id="rejectionReason"
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  placeholder="Explain why this request is being rejected"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                />
              </div>
            )}

            {actionError && (
              <p role="alert" className="text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving…" : "Save decision"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
