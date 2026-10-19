using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ITeamRepository
{
    public Task<List<Team>> ViewOrgTeamsAsync(int orgId);
    public Task<List<Team>> ViewEmpTeamsAsync(int empd);
    public Task<Team?>GetTeamAsync(int teamId);

    public Task<User?> GetUserAsync(int userId);

    public Task AddTeamAsync(Team team);
    public Task RemoveTeamAsync(Team team);

    public Task SaveChangesAsync();
}