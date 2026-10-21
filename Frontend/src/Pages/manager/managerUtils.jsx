
// src/pages/manager/managerUtils.js

export function field(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      return object[key];
    }
  }
  return null;
}

export function listFromResponse(response) {
  let data = response?.data ?? response;

  for (let i = 0; i < 4 && data && !Array.isArray(data); i += 1) {
    data =
      data.items ??
      data.Items ??
      data.data ??
      data.Data ??
      data.results ??
      data.Results;
  }

  return Array.isArray(data) ? data : [];
}

export function getOrganizationId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    const id = field(user, "organizationId", "OrganizationId");

    if (id !== null && id !== "") return id;
  } catch {
    // Try JWT claims.
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))
    );

    return (
      claims.organizationId ??
      claims.OrganizationId ??
      claims.organization_id ??
      null
    );
  } catch {
    return null;
  }
}

export function errorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }

  return (
    data?.message ??
    data?.title ??
    data?.detail ??
    error?.message ??
    "Something went wrong."
  );
}

export function enumLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "Unknown";
  }

  if (typeof value === "string" && !/^\d+$/.test(value)) {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  return String(value);
}

export function statusClass(value) {
  const status = String(value ?? "").toLowerCase();

  if (status.includes("complete") || status.includes("approved")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status.includes("progress") || status.includes("assigned")) {
    return "bg-indigo-50 text-indigo-700";
  }

  if (status.includes("reject") || status.includes("cancel")) {
    return "bg-red-50 text-red-700";
  }

  if (status.includes("pending")) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

export function StatusBadge({ value }) {
  const label = enumLabel(value);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
        label
      )}`}
    >
      {label}
    </span>
  );
}
