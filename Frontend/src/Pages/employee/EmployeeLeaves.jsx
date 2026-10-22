
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import leaveApi from "../../api/leaveApi";

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message ||
    data?.title ||
    error.message ||
    "Something went wrong."
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Invalid date"
    : date.toLocaleDateString();
}

function statusLabel(value) {
  if (value === undefined || value === null) {
    return "Unknown";
  }

  const labels = {
    1: "Pending",
    2: "Granted",
    3: "Cancelled",
    4: "On Hold",
    Pending: "Pending",
    Granted: "Granted",
    Cancelled: "Cancelled",
    Hold: "On Hold",
  };

  return labels[value] ?? String(value);
}

function statusClass(value) {
  const status = statusLabel(value);

  if (status === "Granted") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Cancelled") {
    return "bg-red-100 text-red-700";
  }

  if (status === "On Hold") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getCurrentUserId() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const base64Payload = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      atob(base64Payload)
    );

    const userId =
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ??
      payload.nameid ??
      payload.sub;

    const id = Number(userId);

    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLeaves = useCallback(async () => {
    setLoading(true);

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error(
          "Could not identify the logged-in user from the token."
        );
      }

      const data = await leaveApi.getEmployeeLeaves(userId);

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.$values)
            ? data.$values
            : [];

      setLeaves(records);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please enter a reason for your leave.");
      return;
    }

    if (!from || !to) {
      setError("Please select both leave dates.");
      return;
    }

    // Date inputs return strings in YYYY-MM-DD format.
    const startDate = new Date(`${from}T00:00:00`);
    const endDate = new Date(`${to}T00:00:00`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setError("Please select valid leave dates.");
      return;
    }

    if (endDate < startDate) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    // Match the property names in ApplyLeaveDto.
    // ISO date-only strings are valid inputs for ASP.NET Core DateTime binding.
    const payload = {
      reason: trimmedReason,
      from,
      to,
    };

    setSubmitting(true);

    try {
      console.log("Submitting leave request:", payload);

      await leaveApi.applyLeave(payload);

      setReason("");
      setFrom("");
      setTo("");
      setSuccess("Your leave request has been submitted successfully.");

      await loadLeaves();
    } catch (err) {
      console.error(
        "Leave submission failed:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Leave Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Apply for leave and track the status of your requests.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-5 rounded-xl border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={22} />
            </div>
            <h2 className="font-semibold text-gray-900">
              Apply for Leave
            </h2>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Reason
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={1000}
              required
              placeholder="Explain why you need leave..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="from"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="to"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              id="to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={17} />
            {submitting ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              My Leave Requests
            </h2>

            <button
              type="button"
              onClick={() => {
                setError("");
                loadLeaves();
              }}
              disabled={loading}
              aria-label="Refresh leave requests"
              className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">
              Loading leave requests...
            </p>
          ) : leaves.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              You have not submitted any leave requests yet.
            </p>
          ) : (
            <div className="divide-y">
              {leaves.map((leave, index) => {
                const id = leave.id ?? leave.Id ?? index;
                const status =
                  leave.leaveStatus ?? leave.LeaveStatus;

                return (
                  <article key={id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium text-gray-900">
                        Leave request #{id}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm text-gray-600">
                      {leave.reason ??
                        leave.Reason ??
                        "No reason provided"}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                      <span>
                        From: {formatDate(leave.from ?? leave.From)}
                      </span>
                      <span>
                        To: {formatDate(leave.to ?? leave.To)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
