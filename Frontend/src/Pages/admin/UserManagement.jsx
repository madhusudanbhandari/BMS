
import { useEffect, useState, useCallback } from "react";
import { getPendingUsers, verifyUser } from "../../api/adminApi";

const roles = [
  { label: "Employee", value: "Employee" },
  { label: "HR", value: "HR" },
  { label: "Manager", value: "Manager" },
  { label: "Organization Admin", value: "OrganizationAdmin" },
];

// Must match the C# UserRoles enum values.
const roleMap = {
  OrganizationAdmin: 1,
  PlatformAdmin: 2,
  Employee: 3,
  Manager: 4,
  HR: 5,
};

function getApiError(err, fallback) {
  const data = err.response?.data;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }

  return data?.message || data?.title || fallback;
}

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setError("");

    try {
      const data = await getPendingUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err, "Could not load pending users."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleVerify = async (userId, approved) => {
    if (busyUserId !== null) return;

    setError("");
    setMessage("");
    setBusyUserId(userId);

    try {
      const selectedRole = selectedRoles[userId] || "Employee";
      const numericRole = roleMap[selectedRole];

      if (approved && numericRole === undefined) {
        setError("Please select a valid role.");
        return;
      }

      await verifyUser({
        UserId: Number(userId),
        Status: approved ? 2 : 3,
        Role: numericRole ?? roleMap.Employee,
      });

      setMessage(
        approved
          ? "User approved successfully."
          : "User rejected successfully."
      );

      await loadUsers();
    } catch (err) {
      setError(
        getApiError(err, "Could not process this registration.")
      );
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            WORKSPHERE / ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            User Approvals
          </h1>
          <p className="mt-2 text-gray-500">
            Review registration requests from people joining your
            organization.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pending requests
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {users.length} request
                {users.length === 1 ? "" : "s"} awaiting review
              </p>
            </div>

            <button
              type="button"
              onClick={loadUsers}
              disabled={loading || busyUserId !== null}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="p-10 text-center text-gray-500">
              Loading pending users...
            </p>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="font-semibold text-gray-900">
                All caught up!
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                There are no pending registration requests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => {
                const id = user.id ?? user.Id;
                const firstName =
                  user.firstName ?? user.FirstName ?? "";
                const lastName =
                  user.lastName ?? user.LastName ?? "";
                const email = user.email ?? user.Email ?? "";

                return (
                  <article
                    key={id}
                    className="p-5 transition hover:bg-gray-50/70 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                          {(firstName[0] || email[0] || "U").toUpperCase()}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {[firstName, lastName]
                              .filter(Boolean)
                              .join(" ") || `User ${id}`}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {email}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            User ID: {id}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          aria-label={`Role for ${email || `user ${id}`}`}
                          value={selectedRoles[id] || "Employee"}
                          onChange={(e) =>
                            setSelectedRoles((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          disabled={busyUserId !== null}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleVerify(id, true)}
                          disabled={busyUserId !== null}
                          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {busyUserId === id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerify(id, false)}
                          disabled={busyUserId !== null}
                          className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {busyUserId === id
                            ? "Processing..."
                            : "Reject"}
                        </button>
                      </div>
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
