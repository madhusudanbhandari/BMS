
import { useCallback, useEffect, useState } from "react";
import { Wallet, AlertCircle } from "lucide-react";
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
  return salary.id ?? salary.Id ?? salary.salaryId ??
    salary.SalaryId ?? "";
}

function getAmount(salary) {
  return salary.amount ?? salary.Amount ??
    salary.salaryAmount ?? salary.SalaryAmount ??
    salary.baseSalary ?? salary.BaseSalary;
}

function getStatus(salary) {
  return salary.status ?? salary.Status ?? "Not specified";
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

export default function EmployeeSalary() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                "Unable to load salary records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  return (
    <EmployeePage
      title="My Salary"
      description="View your salary records and their current status."
      onRefresh={loadSalaries}
      refreshing={loading}
    >
      {error && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading salary records...
        </div>
      ) : !error && salaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Wallet size={32} className="mx-auto text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-800">
            No salary records found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your salary records will appear here when available.
          </p>
        </div>
      ) : (
        !error && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Record</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Requested</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {salaries.map((salary, index) => {
                  const requestedAt =
                    salary.requestedAt ?? salary.RequestedAt;

                  return (
                    <tr key={getSalaryId(salary) || index}>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {getSalaryId(salary) || `Record ${index + 1}`}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {formatAmount(getAmount(salary))}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                          {getStatus(salary)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {requestedAt
                          ? new Date(requestedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </EmployeePage>
  );
}
