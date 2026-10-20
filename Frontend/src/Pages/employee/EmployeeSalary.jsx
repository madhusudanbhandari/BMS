import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  FileText,
  Plus,
  X,
  Send,
  CheckCircle2,
} from "lucide-react";

import api from "../../api/axios";
import EmployeePage from "./EmployeePage";

function getItems(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;

  return [];
}

function getSalaryId(salary) {
  return salary.id ?? salary.Id ?? salary.salaryId ?? salary.SalaryId ?? "";
}

function getAmount(salary) {
  return salary.amount ?? salary.Amount ?? salary.salaryAmount ??
    salary.SalaryAmount ?? salary.baseSalary ?? salary.BaseSalary;
}

function getStatus(salary) {
  return salary.salaryStatus ?? salary.SalaryStatus ??
    salary.status ?? salary.Status ?? "Not specified";
}

function getRequestedAt(salary) {
  return salary.requestedAt ?? salary.RequestedAt ??
    salary.createdAt ?? salary.CreatedAt ?? null;
}

function getReleasedAt(salary) {
  return salary.releasedAt ?? salary.ReleasedAt ?? null;
}

function getDuration(salary) {
  return salary.duration ?? salary.Duration;
}

function getAccountName(salary) {
  return salary.accountName ?? salary.AccountName;
}

function getAccountNumber(salary) {
  return salary.accountNumber ?? salary.AccountNumber;
}

function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "Not specified";
  }

  const number = Number(amount);

  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
        maximumFractionDigits: 2,
      }).format(number)
    : String(amount);
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not specified"
    : date.toLocaleDateString("en-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function getStatusStyle(status) {
  const normalized = String(status).toLowerCase();

  if (normalized.includes("approved") || normalized.includes("paid")) {
    return "bg-green-50 text-green-700 ring-green-600/20";
  }

  if (normalized.includes("rejected") || normalized.includes("declined")) {
    return "bg-red-50 text-red-700 ring-red-600/20";
  }

  if (normalized.includes("pending") || normalized.includes("requested")) {
    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }

  return "bg-slate-100 text-slate-700 ring-slate-500/20";
}

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialForm = {
  amount: "",
  duration: "",
  accountName: "",
  accountNumber: "",
  requestedAt: today(),
  releasedAt: "",
};

export default function EmployeeSalary() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRecords, setExpandedRecords] = useState({});
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadSalaries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Salary/get-my-salaries", {
        params: {
          page: 1,
          pageSize: 100,
        },
      });

      setSalaries(getItems(response));
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session could not be authenticated. Please sign in again."
          : err.response?.status === 403
            ? "Your account does not have permission to view salary records."
            : err.response?.data?.message ||
                err.response?.data?.title ||
                err.message ||
                "Unable to load salary records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleRecord(id) {
    setExpandedRecords((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  }

  async function handleRequestSalary(event) {
    event.preventDefault();
    setRequestError("");
    setSuccessMessage("");

    const amount = Number(form.amount);
    const duration = Number(form.duration);

    if (!Number.isFinite(amount) || amount <= 0) {
      setRequestError("Enter a valid salary amount greater than zero.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setRequestError("Duration must be a positive whole number.");
      return;
    }

    if (!form.accountName.trim() || !form.accountNumber.trim()) {
      setRequestError("Enter both the account name and account number.");
      return;
    }

    if (!form.requestedAt) {
      setRequestError("Select the requested date.");
      return;
    }

    if (
      form.releasedAt &&
      form.releasedAt < form.requestedAt
    ) {
      setRequestError(
        "The release date cannot be earlier than the requested date."
      );
      return;
    }

    const payload = {
      Amount: amount,
      Duration: duration,
      AccountName: form.accountName.trim(),
      AccountNumber: form.accountNumber.trim(),
      RequestedAt: `${form.requestedAt}T00:00:00`,
      ReleasedAt: form.releasedAt
        ? `${form.releasedAt}T00:00:00`
        : null,
    };

    setSubmitting(true);

    try {
      await api.post("/Salary/request-salary", payload);

      setForm({
        ...initialForm,
        requestedAt: today(),
      });
      setShowRequestForm(false);
      setSuccessMessage("Your salary request was submitted successfully.");

      await loadSalaries();
    } catch (err) {
      setRequestError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          (err.response?.status === 401
            ? "Your session has expired. Please sign in again."
            : err.response?.status === 403
              ? "You do not have permission to submit this request."
              : "Unable to submit your salary request. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount = salaries.filter((salary) => {
    const status = String(getStatus(salary)).toLowerCase();

    return status.includes("pending") || status.includes("requested");
  }).length;

  return (
    <EmployeePage
      title="My Salary"
      description="Review your salary records and submit salary requests."
      onRefresh={loadSalaries}
      refreshing={loading}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Submit a request or review your existing salary records.
        </p>

        <button
          type="button"
          onClick={() => {
            setRequestError("");
            setSuccessMessage("");
            setShowRequestForm((previous) => !previous);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {showRequestForm ? <X size={18} /> : <Plus size={18} />}
          {showRequestForm ? "Cancel request" : "Request Salary"}
        </button>
      </div>

      {successMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={20} className="shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {showRequestForm && (
        <form
          onSubmit={handleRequestSalary}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              New salary request
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the salary request and payment account details.
            </p>
          </div>

          {requestError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{requestError}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="amount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Amount (NPR)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={handleFormChange}
                placeholder="e.g. 35000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Duration
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                step="1"
                required
                value={form.duration}
                onChange={handleFormChange}
                placeholder="Enter duration"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter the duration in the unit expected by your backend.
              </p>
            </div>

            <div>
              <label
                htmlFor="accountName"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Account name
              </label>
              <input
                id="accountName"
                name="accountName"
                type="text"
                maxLength={150}
                required
                value={form.accountName}
                onChange={handleFormChange}
                placeholder="Name on bank account"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="accountNumber"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Account number
              </label>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                maxLength={50}
                required
                value={form.accountNumber}
                onChange={handleFormChange}
                placeholder="Enter bank account number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="requestedAt"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Requested date
              </label>
              <input
                id="requestedAt"
                name="requestedAt"
                type="date"
                required
                value={form.requestedAt}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="releasedAt"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Release date (optional)
              </label>
              <input
                id="releasedAt"
                name="releasedAt"
                type="date"
                min={form.requestedAt || undefined}
                value={form.releasedAt}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowRequestForm(false);
                setRequestError("");
              }}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button
              type="button"
              onClick={loadSalaries}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading salary records...
          </p>
        </div>
      ) : !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Total salary records
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {salaries.length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Pending requests
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {pendingCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CalendarDays size={24} />
                </div>
              </div>
            </div>
          </div>

          {salaries.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Wallet size={34} className="mx-auto text-slate-400" />
              <h2 className="mt-3 font-semibold text-slate-800">
                No salary records found
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Submit a salary request to get started.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {salaries.map((salary, index) => {
                const salaryId = getSalaryId(salary);
                const recordKey = salaryId || `record-${index}`;
                const status = getStatus(salary);
                const amount = getAmount(salary);
                const requestedAt = getRequestedAt(salary);
                const releasedAt = getReleasedAt(salary);
                const duration = getDuration(salary);
                const accountName = getAccountName(salary);
                const accountNumber = getAccountNumber(salary);
                const isExpanded = Boolean(expandedRecords[recordKey]);

                return (
                  <article
                    key={recordKey}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <CircleDollarSign size={25} />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                              Salary record
                            </p>
                            <h2 className="mt-1 font-semibold text-slate-900">
                              {salaryId || `Record ${index + 1}`}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                              Requested: {formatDate(requestedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs text-slate-500">
                            Salary amount
                          </p>
                          <p className="mt-1 text-xl font-bold text-slate-900">
                            {formatAmount(amount)}
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => toggleRecord(recordKey)}
                          aria-expanded={isExpanded}
                          className="flex w-full items-center justify-between text-sm font-medium text-indigo-700 hover:text-indigo-900"
                        >
                          <span className="flex items-center gap-2">
                            <FileText size={17} />
                            View record details
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-4 rounded-lg bg-slate-50 p-4">
                            <dl className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Record ID
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-800">
                                  {salaryId || "Not specified"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Current status
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-800">
                                  {status}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Duration
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {duration ?? "Not specified"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Requested date
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {formatDate(requestedAt)}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Release date
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {formatDate(releasedAt)}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Account name
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {accountName || "Not specified"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                  Account number
                                </dt>
                                <dd className="mt-1 break-all text-sm text-slate-800">
                                  {accountNumber || "Not specified"}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </EmployeePage>
  );
}