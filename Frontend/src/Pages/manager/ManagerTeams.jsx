
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, UserPlus, UserMinus } from "lucide-react";
import {
  getTeams,
  createTeam,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
  getOrganizationEmployees,
} from "../../api/managerApi";
import {
  field,
  listFromResponse,
  errorMessage,
} from "./managerUtils";

export default function ManagerTeams() {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [teamResponse, employeeResponse] = await Promise.all([
        getTeams(),
        getOrganizationEmployees(),
      ]);

      setTeams(listFromResponse(teamResponse));
      setEmployees(listFromResponse(employeeResponse));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!name.trim()) throw new Error("Team name is required.");

      await createTeam({ Name: name.trim() });
      setName("");
      setNotice("Team created successfully.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMember(teamId) {
    const userId = memberIds[teamId];

    if (!userId) {
      setError("Choose an employee before adding a member.");
      return;
    }

    setError("");
    setNotice("");

    try {
      await addTeamMember({
        TeamId: Number(teamId),
        UserId: Number(userId),
      });

      setNotice("Employee added to the team.");
      setMemberIds((prev) => ({ ...prev, [teamId]: "" }));
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleRemoveMember(teamId, userId) {
    if (!window.confirm("Remove this employee from the team?")) return;

    setError("");
    setNotice("");

    try {
      await removeTeamMember(teamId, userId);
      setNotice("Employee removed from the team.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDelete(team) {
    const id = field(team, "id", "Id");
    const teamName = field(team, "name", "Name") ?? "this team";

    if (!window.confirm(`Delete "${teamName}"? This action cannot be undone.`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await deleteTeam(id);
      setNotice("Team deleted successfully.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function getMembers(team) {
    const members = field(team, "members", "Members");
    return Array.isArray(members) ? members : [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create teams and manage their employee membership.
          </p>
        </div>

        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New team name"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
        <button
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Plus size={17} /> {saving ? "Creating..." : "Create team"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
          <RefreshCw size={18} className="animate-spin" /> Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No teams found. Create your first team above.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {teams.map((team, index) => {
            const teamId = field(team, "id", "Id");
            const teamName = field(team, "name", "Name") ?? "Unnamed team";
            const members = getMembers(team);

            return (
              <section key={teamId ?? index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-bold text-slate-900">{teamName}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {members.length} member(s) · Team ID: {teamId ?? "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(team)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Delete team"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={memberIds[teamId] ?? ""}
                      onChange={(e) => setMemberIds((prev) => ({ ...prev, [teamId]: e.target.value }))}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">Choose employee</option>
                      {employees.map((employee, employeeIndex) => {
                        const userId = field(employee, "id", "Id", "userId", "UserId");
                        const email = field(employee, "email", "Email");
                        const employeeName = field(employee, "name", "Name", "fullName", "FullName");
                        const alreadyMember = members.some(
                          (member) =>
                            String(field(member, "id", "Id", "userId", "UserId")) === String(userId)
                        );

                        return (
                          <option
                            key={userId ?? employeeIndex}
                            value={userId}
                            disabled={alreadyMember || userId == null}
                          >
                            {employeeName ?? email ?? `User ${userId}`}
                            {alreadyMember ? " (already a member)" : ""}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleAddMember(teamId)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <UserPlus size={16} /> Add
                    </button>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Team members
                    </h3>

                    {members.length === 0 ? (
                      <p className="text-sm text-slate-500">No members assigned yet.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {members.map((member, memberIndex) => {
                          const userId = field(member, "id", "Id", "userId", "UserId");
                          const email = field(member, "email", "Email");
                          const memberName = field(member, "name", "Name", "fullName", "FullName");

                          return (
                            <li key={userId ?? memberIndex} className="flex items-center justify-between gap-3 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {memberName ?? email ?? `User ${userId}`}
                                </p>
                                {memberName && email && (
                                  <p className="truncate text-xs text-slate-500">{email}</p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveMember(teamId, userId)}
                                disabled={userId == null}
                                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                              >
                                <UserMinus size={14} /> Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
