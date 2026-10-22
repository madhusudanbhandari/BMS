import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Wallet,
  X,
  Save,
} from "lucide-react";
import api from "../../api/axios";
import {
  PAGE_SIZE,
  getItems,
  getTotal,
  getErrorMessage,
  employeeIdOf,
  money,
  dateText,
  normalizeStatus,
  StatusBadge,
  PageHeader,
  ErrorMessage,
} from "./HrUtils";

const SALARY_STATUS = {
  Pending: 1,
  Reviewed: 2,
  Released: 3,
  Rejected: 4,
};

const salaryStatuses = {
  1: "Pending",
  2: "Reviewed",
  3: "Released",
  4: "Rejected",
};

const requestIdOf = (item) => item?.id ?? item?.Id;
const amountOf = (item) => item?.amount ?? item?.Amount;

const statusOf = (item) =>
  normalizeStatus(
    item?.salaryStatus ??
      item?.SalaryStatus ??
      item?.status ??
      item?.Status,
    salaryStatuses
  );

export default function HRSalaryRequests() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("Reviewed");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Salary/view-all-requests", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          ...(filter ? { status: filter } : {}),
        },
      });

      const items = getItems(response);

      setRequests(items);
      setTotal(getTotal(response, items));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = requests.filter((item) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      String(requestIdOf(item) ?? "")
        .toLowerCase()
        .includes(query) ||
      String(employeeIdOf(item) ?? "")
        .toLowerCase()
        .includes(query)
    );
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function openReview(item) {
    setSelected(item);

    const current = statusOf(item);

    setNewStatus(
      Object.prototype.hasOwnProperty.call(SALARY_STATUS, current)
        ? current
        : "Reviewed"
    );

    setReason(
      item?.rejectionReason ?? item?.RejectionReason ?? ""
    );

    setActionError("");
    setNotice("");
  }

  async function saveReview(event) {
    event.preventDefault();

    if (!selected || saving) return;

    const salaryId = requestIdOf(selected);
    const empId = employeeIdOf(selected);

    if (salaryId == null || empId == null) {
      setActionError(
        "This request is missing its salary ID or employee ID."
      );
      return;
    }

    if (newStatus === "Rejected" && !reason.trim()) {
      setActionError("Enter a reason for rejection.");
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      await api.patch(
        "/Salary/update-salary",
        {
          salaryStatus: SALARY_STATUS[newStatus],
          rejectionReason:
            newStatus === "Rejected" ? reason.trim() : null,
        },
        {
          params: { empId, salaryId },
        }
      );

      setSelected(null);
      setNotice("Salary request updated successfully.");

      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Salary Requests"
        description="Review employee salary requests and update their status."
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

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request ID or employee ID"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Released">Released</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading salary requests...
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet
              size={32}
              className="mx-auto mb-3 text-slate-400"
            />
            <p className="font-semibold text-slate-900">
              No salary requests found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Request ID",
                    "Employee ID",
                    "Amount",
                    "Duration",
                    "Requested",
                    "Status",
                    "Action",
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
                {visible.map((item, index) => (
                  <tr
                    key={requestIdOf(item) ?? index}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {requestIdOf(item) ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {employeeIdOf(item) ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {money(amountOf(item))}
                    </td>

                    <td className="px-5 py-4">
                      {item.duration ?? item.Duration ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {dateText(
                        item.requestedAt ?? item.RequestedAt
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={statusOf(item)} />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openReview(item)}
                        className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Review / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Page {page} of {pages} · {total} requests
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={saveReview}
            className="my-auto w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Review Salary Request
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Request #{requestIdOf(selected)} · Employee #
                  {employeeIdOf(selected)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Requested amount
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {money(amountOf(selected))}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                Current status:
                <StatusBadge status={statusOf(selected)} />
              </div>
            </div>

            <div>
              <label
                htmlFor="salaryStatus"
                className="mb-2 block text-sm font-medium"
              >
                New status
              </label>
              <select
                id="salaryStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              >
                {Object.keys(SALARY_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {newStatus === "Rejected" && (
              <div>
                <label
                  htmlFor="rejectionReason"
                  className="mb-2 block text-sm font-medium"
                >
                  Rejection reason
                </label>
                <textarea
                  id="rejectionReason"
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  placeholder="Explain why this request is rejected"
                />
              </div>
            )}

            <ErrorMessage>{actionError}</ErrorMessage>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save decision"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}