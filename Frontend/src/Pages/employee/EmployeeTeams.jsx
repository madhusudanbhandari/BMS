
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserRound,
  Mail,
  Building2,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  UsersRound,
  Hash,
} from "lucide-react";

import api from "../../api/axios";
import EmployeePage from "./EmployeePage";

function getValue(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      return object[key];
    }
  }

  return undefined;
}

function getTeamId(team) {
  return getValue(team, "id", "Id", "teamId", "TeamId");
}

function getTeamName(team) {
  return getValue(team, "name", "Name", "teamName", "TeamName") ||
    "Unnamed team";
}

function getMembers(team) {
  const members = getValue(
    team,
    "members",
    "Members",
    "teamMembers",
    "TeamMembers",
    "users",
    "Users"
  );

  return Array.isArray(members) ? members : [];
}

function getMemberId(member) {
  return getValue(member, "id", "Id", "userId", "UserId");
}

function getMemberName(member) {
  const fullName = getValue(
    member,
    "fullName",
    "FullName",
    "name",
    "Name"
  );

  if (fullName) return fullName;

  const firstName = getValue(member, "firstName", "FirstName") || "";
  const lastName = getValue(member, "lastName", "LastName") || "";
  const combined = `${firstName} ${lastName}`.trim();

  return (
    combined ||
    getValue(member, "userName", "UserName", "username", "Username") ||
    getValue(member, "email", "Email") ||
    "Unnamed member"
  );
}

function getMemberEmail(member) {
  return getValue(member, "email", "Email") || "No email provided";
}

function getMemberRole(member) {
  return getValue(
    member,
    "role",
    "Role",
    "userRole",
    "UserRole",
    "roleName",
    "RoleName"
  );
}

function getOrganizationName(team) {
  const organization = getValue(
    team,
    "organization",
    "Organization"
  );

  return (
    getValue(team, "organizationName", "OrganizationName") ||
    getValue(organization, "name", "Name") ||
    "Not provided"
  );
}

function getProjects(team) {
  const projects = getValue(team, "projects", "Projects");

  return Array.isArray(projects) ? projects : [];
}

function getDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.Message ||
    data?.title ||
    data?.detail ||
    (error.response?.status === 401
      ? "Your session has expired. Please sign in again."
      : error.response?.status === 403
        ? "You do not have permission to view your teams."
        : "Failed to load teams. Please try again.")
  );
}

export default function EmployeeTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTeams, setExpandedTeams] = useState({});

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Team/view-my-teams");
      const data = response.data;

      const items = Array.isArray(data)
        ? data
        : data?.items ??
          data?.Items ??
          data?.data ??
          data?.Data ??
          [];

      setTeams(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  function toggleTeam(teamKey) {
    setExpandedTeams((previous) => ({
      ...previous,
      [teamKey]: !previous[teamKey],
    }));
  }

  return (
    <EmployeePage
      title="My Teams"
      description="View your teams, team members, organization details, and associated projects."
      onRefresh={loadTeams}
      refreshing={loading}
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadTeams}
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
            Loading your teams...
          </p>
        </div>
      ) : !error && teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <UsersRound
            size={36}
            className="mx-auto text-slate-400"
          />
          <h2 className="mt-3 font-semibold text-slate-800">
            No teams assigned
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            You have not been assigned to a team yet.
          </p>
        </div>
      ) : (
        !error && (
          <>
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      My teams
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {teams.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <UsersRound size={25} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total team memberships
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {teams.reduce(
                        (total, team) => total + getMembers(team).length,
                        0
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Users size={25} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Counts members across your teams, including repeated members.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {teams.map((team, index) => {
                const id = getTeamId(team);
                const teamKey = id ?? `team-${index}`;
                const name = getTeamName(team);
                const members = getMembers(team);
                const projects = getProjects(team);
                const isExpanded = Boolean(expandedTeams[teamKey]);

                const description = getValue(
                  team,
                  "description",
                  "Description"
                );

                const createdAt = getValue(
                  team,
                  "createdAt",
                  "CreatedAt",
                  "createdDate",
                  "CreatedDate"
                );

                const organizationId = getValue(
                  team,
                  "organizationId",
                  "OrganizationId"
                );

                return (
                  <article
                    key={teamKey}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                            <UsersRound size={28} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-bold text-slate-900">
                                {name}
                              </h2>

                              {id !== undefined && (
                                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                  Team #{id}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {description ||
                                "No team description provided."}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Users size={15} />
                                {members.length}{" "}
                                {members.length === 1 ? "member" : "members"}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <FolderKanban size={15} />
                                {projects.length}{" "}
                                {projects.length === 1 ? "project" : "projects"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTeam(teamKey)}
                          aria-expanded={isExpanded}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {isExpanded ? "Hide details" : "Full details"}
                          {isExpanded ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </button>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                            <Building2 size={15} />
                            Organization
                          </div>
                          <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                            {getOrganizationName(team)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                            <Users size={15} />
                            Team members
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {members.length}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                            <FolderKanban size={15} />
                            Associated projects
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {projects.length}
                          </p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-6 space-y-6 border-t border-slate-100 pt-6">
                          <section>
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                              <Hash size={18} className="text-indigo-600" />
                              Team information
                            </h3>

                            <dl className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Team ID
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {id ?? "Not provided"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Team name
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {name}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Organization ID
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {organizationId ?? "Not provided"}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Created date
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">
                                  {getDate(createdAt)}
                                </dd>
                              </div>

                              <div className="sm:col-span-2">
                                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Description
                                </dt>
                                <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                                  {description || "No description provided."}
                                </dd>
                              </div>
                            </dl>
                          </section>

                          <section>
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                                <Users size={18} className="text-indigo-600" />
                                Team members
                              </h3>

                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                {members.length} total
                              </span>
                            </div>

                            {members.length === 0 ? (
                              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                No member details were returned for this team.
                              </p>
                            ) : (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {members.map((member, memberIndex) => {
                                  const memberId = getMemberId(member);
                                  const memberName = getMemberName(member);
                                  const email = getMemberEmail(member);
                                  const role = getMemberRole(member);

                                  return (
                                    <div
                                      key={
                                        memberId ??
                                        `${teamKey}-member-${memberIndex}`
                                      }
                                      className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 p-4"
                                    >
                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        {getInitials(memberName)}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="break-words font-semibold text-slate-900">
                                          {memberName}
                                        </p>

                                        <p className="mt-1 flex items-start gap-1.5 break-all text-sm text-slate-500">
                                          <Mail
                                            size={15}
                                            className="mt-0.5 shrink-0"
                                          />
                                          {email}
                                        </p>

                                        {memberId !== undefined && (
                                          <p className="mt-1 text-xs text-slate-400">
                                            User ID: {memberId}
                                          </p>
                                        )}

                                        {role !== undefined && (
                                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                            {String(role)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </section>

                          <section>
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                              <FolderKanban
                                size={18}
                                className="text-indigo-600"
                              />
                              Associated projects
                            </h3>

                            {projects.length === 0 ? (
                              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                No project details were returned for this team.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {projects.map((project, projectIndex) => {
                                  const projectId = getValue(
                                    project,
                                    "id",
                                    "Id",
                                    "projectId",
                                    "ProjectId"
                                  );

                                  const projectName = getValue(
                                    project,
                                    "name",
                                    "Name",
                                    "projectName",
                                    "ProjectName"
                                  ) || "Unnamed project";

                                  const projectDescription = getValue(
                                    project,
                                    "description",
                                    "Description"
                                  );

                                  const status = getValue(
                                    project,
                                    "projectStatus",
                                    "ProjectStatus",
                                    "status",
                                    "Status"
                                  );

                                  return (
                                    <div
                                      key={
                                        projectId ??
                                        `${teamKey}-project-${projectIndex}`
                                      }
                                      className="rounded-xl border border-slate-200 p-4"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                          <p className="font-semibold text-slate-900">
                                            {projectName}
                                          </p>

                                          {projectId !== undefined && (
                                            <p className="mt-1 text-xs text-slate-500">
                                              Project ID: {projectId}
                                            </p>
                                          )}
                                        </div>

                                        {status !== undefined && (
                                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                            {String(status)}
                                          </span>
                                        )}
                                      </div>

                                      {projectDescription && (
                                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                          {projectDescription}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </section>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )
      )}
    </EmployeePage>
  );
}
