import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Wallet,
  Clock3,
  CheckCircle2,
  CalendarDays,
  ClipboardCheck,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import {
  getItems,
  getTotal,
  getErrorMessage,
  PageHeader,
  ErrorMessage,
} from "./HrUtils";

const shortcuts = [
  {
    title: "Manage employees",
    description: "Browse employees in your organization.",
    to: "/hr/employees",
    icon: Users,
  },
  {
    title: "Review salary requests",
    description: "Review requests and update their statuses.",
    to: "/hr/salary-requests",
    icon: Wallet,
  },
  {
    title: "Manage leave",
    description: "Review employee leave applications.",
    to: "/hr/leaves",
    icon: CalendarDays,
  },
  {
    title: "Attendance",
    description: "View attendance records and daily trends.",
    to: "/hr/attendance",
    icon: ClipboardCheck,
  },
];

export default function HROverview() {
  const [stats, setStats] = useState({
    employees: 0,
    salaryRequests: 0,
    pendingSalary: 0,
    processedSalary: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [
        employeesRes,
        allRes,
        pendingRes,
        reviewedRes,
        rejectedRes,
        releasedRes,
      ] = await Promise.all([
        api.get("/Auth/organization-employees", {
          params: { page: 1, pageSize: 1 },
        }),
        api.get("/Salary/view-all-requests", {
          params: { page: 1, pageSize: 1 },
        }),
        api.get("/Salary/view-all-requests", {
          params: { page: 1, pageSize: 1, status: "Pending" },
        }),
        api.get("/Salary/view-all-requests", {
          params: { page: 1, pageSize: 1, status: "Reviewed" },
        }),
        api.get("/Salary/view-all-requests", {
          params: { page: 1, pageSize: 1, status: "Rejected" },
        }),
        api.get("/Salary/view-all-requests", {
          params: { page: 1, pageSize: 1, status: "Released" },
        }),
      ]);

      setStats({
        employees: getTotal(
          employeesRes,
          getItems(employeesRes)
        ),
        salaryRequests: getTotal(allRes, getItems(allRes)),
        pendingSalary: getTotal(
          pendingRes,
          getItems(pendingRes)
        ),
        processedSalary:
          getTotal(reviewedRes, getItems(reviewedRes)) +
          getTotal(rejectedRes, getItems(rejectedRes)) +
          getTotal(releasedRes, getItems(releasedRes)),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cards = [
    {
      label: "Employees",
      value: stats.employees,
      icon: Users,
      tone: "bg-indigo-50 text-indigo-600",
      to: "/hr/employees",
    },
    {
      label: "Salary requests",
      value: stats.salaryRequests,
      icon: Wallet,
      tone: "bg-violet-50 text-violet-600",
      to: "/hr/salary-requests",
    },
    {
      label: "Pending salary requests",
      value: stats.pendingSalary,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-600",
      to: "/hr/salary-requests",
    },
    {
      label: "Processed salary requests",
      value: stats.processedSalary,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600",
      to: "/hr/salary-requests",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="HR Overview"
        description="A quick view of employee and salary activity in your organization."
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
            >
              <Icon size={22} />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {label}
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {loading ? "—" : value}
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
              View details <ArrowUpRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          HR tools
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {shortcuts.map(({ title, description, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Icon size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {description}
                </p>
              </div>

              <ArrowUpRight size={18} className="text-slate-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}