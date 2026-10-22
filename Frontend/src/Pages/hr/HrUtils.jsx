export const PAGE_SIZE = 10;

export function unwrap(response) {
  return response?.data ?? response;
}

export function getItems(response) {
  const data = unwrap(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  const items =
    data?.items ??
    data?.Items ??
    data?.requests ??
    data?.Requests ??
    data?.employees ??
    data?.Employees ??
    data?.records ??
    data?.Records ??
    data?.data?.items ??
    data?.data?.Items;

  return Array.isArray(items) ? items : [];
}

export function getTotal(response, items = []) {
  const data = unwrap(response);

  const value =
    data?.totalCount ??
    data?.TotalCount ??
    data?.totalItems ??
    data?.TotalItems ??
    data?.totalRecords ??
    data?.TotalRecords ??
    data?.data?.totalCount ??
    data?.data?.TotalCount;

  return value != null && Number.isFinite(Number(value))
    ? Number(value)
    : items.length;
}

export function getErrorMessage(err) {
  const data = err?.response?.data;

  if (data?.message) return data.message;
  if (data?.title) return data.title;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }

  return err?.message ?? "Something went wrong.";
}

export function normalizeStatus(value, map = {}) {
  if (value == null || value === "") return "Unknown";

  const str = String(value).trim();

  if (/^\d+$/.test(str)) {
    return map[Number(str)] ?? "Unknown";
  }

  return (
    Object.keys(map).find(
      (key) => key.toLowerCase() === str.toLowerCase()
    ) ?? str
  );
}

export function employeeIdOf(item) {
  return (
    item?.userId ??
    item?.UserId ??
    item?.employeeId ??
    item?.EmployeeId ??
    item?.id ??
    item?.Id
  );
}

export function employeeName(item) {
  const name =
    item?.fullName ??
    item?.FullName ??
    item?.name ??
    item?.Name;

  if (name) return name;

  return [
    item?.firstName ?? item?.FirstName,
    item?.lastName ?? item?.LastName,
  ]
    .filter(Boolean)
    .join(" ") || "—";
}

export function money(value) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function dateText(value) {
  if (!value) return "—";

  // Keep date-only values from shifting to the previous day
  // because of timezone conversion.
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-");
    return `${month}/${day}/${year}`;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}

export function StatusBadge({ status }) {
  const normalized = String(status ?? "Unknown").toLowerCase();

  const style =
    ["pending", "hold"].includes(normalized)
      ? "bg-amber-50 text-amber-700"
      : [
          "approved",
          "granted",
          "reviewed",
          "released",
          "present",
        ].includes(normalized)
        ? "bg-emerald-50 text-emerald-700"
        : [
            "rejected",
            "cancelled",
            "absent",
          ].includes(normalized)
          ? "bg-red-50 text-red-700"
          : ["in progress", "late"].includes(normalized)
            ? "bg-indigo-50 text-indigo-700"
            : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {status ?? "Unknown"}
    </span>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action}
    </div>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
    </div>
  );
}