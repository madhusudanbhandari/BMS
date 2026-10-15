
import { useEffect, useState } from "react";
import api from "../../api/axios";
import EmployeePage from "./EmployeePage";

export default function EmployeeTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTeams() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Team/view-teams");
      const data = response.data;
      setTeams(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <EmployeePage
      title="My Teams"
      description="View the teams you belong to."
      onRefresh={loadTeams}
    >
      {loading ? (
        <p>Loading teams...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : teams.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-gray-500">
          You have not been assigned to a team yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team.id ?? team.Id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold text-gray-900">
                {team.name ?? team.Name}
              </h2>
            </article>
          ))}
        </div>
      )}
    </EmployeePage>
  );
}
