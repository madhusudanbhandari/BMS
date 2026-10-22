
import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import attendanceApi from "../../api/attendenceApi";

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.message ||
    "Something went wrong."
  );
}

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await attendanceApi.getMyAttendance();

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  async function handleAttend() {
    setMarking(true);
    setError("");
    setSuccess("");

    try {
      await attendanceApi.attend();

      setSuccess("Attendance marked successfully.");
      await loadAttendance();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  }

  const today = new Date().toDateString();

  const attendedToday = records.some((record) => {
    const value = record.dateTime ?? record.DateTime;

    return value && new Date(value).toDateString() === today;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Attendance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mark your attendance and review your attendance history.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAttendance}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
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

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Today's Attendance
              </h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="mt-5 text-lg font-semibold">
            {attendedToday ? "Attendance recorded" : "Not recorded yet"}
          </p>

          <button
            type="button"
            onClick={handleAttend}
            disabled={marking || loading || attendedToday}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {marking
              ? "Marking attendance..."
              : attendedToday
                ? "Already marked today"
                : "Mark Attendance"}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            The server must enforce the once-per-day attendance rule.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Total Records
              </h2>
              <p className="text-sm text-gray-500">
                Records returned by the server
              </p>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-gray-900">
            {loading ? "—" : records.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Attendance History
          </h2>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">
            Loading attendance...
          </p>
        ) : records.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No attendance records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {records.map((record, index) => {
                  const dateValue =
                    record.dateTime ?? record.DateTime;

                  const date = dateValue
                    ? new Date(dateValue)
                    : null;

                  return (
                    <tr
                      key={record.id ?? record.Id ?? index}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4">
                        {date && !Number.isNaN(date.getTime())
                          ? date.toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {date && !Number.isNaN(date.getTime())
                          ? date.toLocaleTimeString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {record.role ?? record.Role ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
