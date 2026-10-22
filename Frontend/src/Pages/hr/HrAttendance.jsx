import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw, UsersRound, UserCheck, UserX, Clock } from "lucide-react";
import attendanceApi from "../../api/attendenceApi";

import {
  getItems,
  getErrorMessage,
  employeeIdOf,
  employeeName,
  dateText,
  normalizeStatus,
  StatusBadge,
  PageHeader,
  ErrorMessage,
} from "./HrUtils";

const attendanceStatuses = {
  1: "Present",
  2: "Absent",
  3: "Late",
};

export default function HRAttendance() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const orgId = Number(
        user.organizationId ?? user.OrganizationId
      );

      if (!orgId) {
        throw new Error(
          "Organization ID is missing from the logged-in user."
        );
      }

      const response =
        await attendanceApi.getOrganizationAttendance(orgId);

      const data = getItems(response);


      // Filter records by the selected date.
      const filteredData = data.filter((item) => {
        const attendanceDate =
          item.date ??
          item.Date ??
          item.attendanceDate ??
          item.AttendanceDate;

        return (
          !attendanceDate ||
          dateText(attendanceDate) === date
        );
      });

      setItems(filteredData);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const statusOf = (item) =>
    normalizeStatus(
      item.status ??
        item.Status ??
        item.attendanceStatus ??
        item.AttendanceStatus,
      attendanceStatuses
    );

  const present = items.filter(
    (item) => statusOf(item) === "Present"
  ).length;

  const absent = items.filter(
    (item) => statusOf(item) === "Absent"
  ).length;

  const late = items.filter(
    (item) => statusOf(item) === "Late"
  ).length;

  const cards = [
    {
      label: "Total Records",
      value: items.length,
      icon: UsersRound,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Present",
      value: present,
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Absent",
      value: absent,
      icon: UserX,
      color: "bg-red-50 text-red-700",
    },
    {
      label: "Late",
      value: late,
      icon: Clock,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Attendance Management"
        description="Review employee attendance records for a selected day."
        action={
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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

      {/* Date filter */}
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label
            htmlFor="attendanceDate"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Attendance date
          </label>

          <input
            id="attendanceDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <p className="text-sm text-slate-500">
          Records found:{" "}
          <strong className="text-slate-900">
            {loading ? "—" : items.length}
          </strong>
        </p>
      </section>

      {/* Summary cards */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : card.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Attendance table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Employee Attendance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Attendance details for {date}
            </p>
          </div>

          <ClipboardCheck
            size={22}
            className="text-slate-400"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <RefreshCw
              size={22}
              className="mx-auto mb-3 animate-spin"
            />
            Loading attendance records...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck
              size={36}
              className="mx-auto mb-3 text-slate-400"
            />

            <p className="font-semibold text-slate-900">
              No attendance records found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try selecting another date or refreshing the records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Employee ID",
                    "Employee Name",
                    "Attendance Date",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-5 py-3 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const nestedEmployee =
                    item.employee ?? item.Employee;

                  const name =
                    item.employeeName ??
                    item.EmployeeName ??
                    (nestedEmployee
                      ? employeeName(nestedEmployee)
                      : "Unknown Employee");

                  return (
                    <tr
                      key={item.id ?? item.Id ?? index}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {employeeIdOf(item) ?? "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700">
                            {name !== "Unknown Employee"
                              ? name.charAt(0).toUpperCase()
                              : "?"}
                          </div>

                          <span className="font-semibold text-slate-900">
                            {name}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {dateText(
                          item.date ??
                            item.Date ??
                            item.attendanceDate ??
                            item.AttendanceDate ??
                            date
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={statusOf(item)} />
                      </td>
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