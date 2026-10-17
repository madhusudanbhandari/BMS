
import { useEffect, useState } from "react";
import {
  createTeam,
  getTeams,
  addTeamMembers,
  removeTeamMember,
  deleteTeam,
} from "../../api/adminApi";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

const buttonClass =
  "rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60";

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [memberInputs, setMemberInputs] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadTeams = async () => {
    try {
      setError("");
      const data = await getTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load teams. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const runAction = async (action, successMessage) => {
    setError("");
    setMessage("");
    setBusy(true);

    try {
      await action();
      setMessage(successMessage);
      await loadTeams();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "The operation failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    const name = teamName.trim();
    if (!name) return;

    await runAction(
      () => createTeam({ name }),
      "Team created successfully."
    );

    setTeamName("");
  };

const handleAddMember = async (teamId) => {
  const rawValue = memberInputs[teamId]?.trim();
  const userId = Number(rawValue);

  if (!rawValue || !Number.isInteger(userId) || userId <= 0) {
    setError("Enter a valid user ID.");
    return;
  }

  await runAction(
    () =>
      addTeamMembers({
        teamId: Number(teamId),
        userId: userId,
      }),
    "Member added successfully."
  );

  setMemberInputs((prev) => ({ ...prev, [teamId]: "" }));
};


  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm("Remove this member from the team?")) return;

    await runAction(
      () => removeTeamMember(teamId, userId),
      "Member removed successfully."
    );
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    await runAction(
      () => deleteTeam(teamId),
      "Team deleted successfully."
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            WORKSPHERE / ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Team Management
          </h1>
          <p className="mt-2 text-gray-500">
            Create teams and manage your organization's team members.
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

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Create a team
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Give your new team a clear name.
          </p>

          <form
            onSubmit={handleCreateTeam}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Engineering"
              maxLength={150}
              required
              className={inputClass}
            />
            <button disabled={busy} className={buttonClass}>
              Create team
            </button>
          </form>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your teams
          </h2>
          <button
            onClick={loadTeams}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Loading teams...
          </p>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <h3 className="font-semibold text-gray-900">
              No teams yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first team to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {teams.map((team) => {
              const members = team.members ?? team.Members ?? [];

              return (
                <section
                  key={team.id ?? team.Id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {team.name ?? team.Name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {members.length} member
                        {members.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleDeleteTeam(team.id ?? team.Id)
                      }
                      disabled={busy}
                      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                      Members
                    </h4>

                    {members.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No members have been added.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {members.map((member) => {
                          const userId = member.id ?? member.Id;
                          const fullName =
                            [member.firstName ?? member.FirstName,
                             member.lastName ?? member.LastName]
                              .filter(Boolean)
                              .join(" ") || member.email || member.Email ||
                              `User ${userId}`;

                          return (
                            <li
                              key={userId}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {fullName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {userId}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveMember(
                                    team.id ?? team.Id,
                                    userId
                                  )
                                }
                                disabled={busy}
                                className="shrink-0 text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <form
                    className="mt-5 flex gap-2 border-t border-gray-100 pt-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddMember(team.id ?? team.Id);
                    }}
                  >
                    <input
                      type="number"
                      min="1"
                      value={
                        memberInputs[team.id ?? team.Id] ?? ""
                      }
                      onChange={(e) =>
                        setMemberInputs((prev) => ({
                          ...prev,
                          [team.id ?? team.Id]: e.target.value,
                        }))
                      }
                      placeholder="Member user ID"
                      required
                      className={inputClass}
                    />
                    <button disabled={busy} className={buttonClass}>
                      Add
                    </button>
                  </form>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}