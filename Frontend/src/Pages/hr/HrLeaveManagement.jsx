import { useCallback, useEffect, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import api from "../../api/axios";
import leaveApi from "../../api/leaveApi";
import {
  PAGE_SIZE,
  getItems,
  getTotal,
  getErrorMessage,
  employeeIdOf,
  employeeName,
  dateText,
  normalizeStatus,
  StatusBadge,
  PageHeader,
  ErrorMessage,
} from "./HrUtils";

const leaveStatuses = {
  1: "Pending",
  2: "Granted",
  3: "Cancelled",
  4: "Hold",
};

const idOf = (item) =>
  item?.id ??
  item?.Id ??
  item?.leaveId ??
  item?.LeaveId;

const statusOf = (item) =>
  normalizeStatus(
    item?.leaveStatus ??
      item?.LeaveStatus ??
      item?.status ??
      item?.Status,
    leaveStatuses
  );

const statusValue = {
  Granted: 2,
  Hold: 4,
};

export default function HRLeaveManagement() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Leave/view-all-leaves", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          ...(status ? { status } : {}),
        },
      });

      const data = getItems(response);

      setItems(data);
      setTotal(getTotal(response, data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateLeave(leave, nextStatus) {
    const id = idOf(leave);

    if (id == null) {
      setError("This leave record has no ID.");
      return;
    }

    const leaveStatus = statusValue[nextStatus];

    if (leaveStatus == null) {
      setError("Invalid leave status.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await leaveApi.updateLeave(id, {
        leaveStatus,
      });

      setNotice(`Leave request marked ${nextStatus.toLowerCase()}.`);

      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Leave Management"
        description="Review leave applications and track their status."
        action={
          <button
            type="button"
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
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Leave applications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review pending requests before changing their status.
            </p>
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Granted">Granted</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Hold">Hold</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading leave applications...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays
              size={32}
              className="mx-auto mb-3 text-slate-400"
            />
            <p className="font-semibold text-slate-900">
              No leave applications found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Leave ID",
                    "Employee",
                    "From",
                    "To",
                    "Reason",
                    "Status",
                    "Actions",
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
                {items.map((item, index) => {
                  const current = statusOf(item);
                  const id = idOf(item) ?? index;
                  const nestedEmployee = item.employee ?? item.Employee;

                  return (
                    <tr key={id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium">
                        {idOf(item) ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        {item.employeeName ??
                          item.EmployeeName ??
                          (nestedEmployee
                            ? employeeName(nestedEmployee)
                            : employeeIdOf(item)) ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        {dateText(item.from ?? item.From)}
                      </td>

                      <td className="px-5 py-4">
                        {dateText(item.to ?? item.To)}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        {item.reason ??
                          item.Reason ??
                          item.description ??
                          item.Description ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={current} />
                      </td>

                      <td className="px-5 py-4">
                        {current === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busyId === id}
                              onClick={() => updateLeave(item, "Granted")}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              {busyId === id ? "Saving..." : "Grant"}
                            </button>

                            <button
                              type="button"
                              disabled={busyId === id}
                              onClick={() => updateLeave(item, "Hold")}
                              className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 disabled:opacity-50"
                            >
                              Hold
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Page {page} · {total} requests
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page * PAGE_SIZE >= total || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}