using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ITeamService
{
    public Task<ViewTeamDto> CreateTeamAsync(int adminId,CreateTeamDto dto);
    public Task<ViewTeamDto> AddMembersToTeamAsync(int adminId,AddMembersToTeamDto dto);
    public Task<List<ViewTeamDto>> ViewAllTeamsAsync(int orgId);
    public Task<bool?> RemoveMemberAsync(int adminId,int teamId, int memberId);
    public Task<bool?> DeleteTeamAsync(int adminId,int teamId);
}