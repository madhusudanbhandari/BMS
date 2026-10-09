using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ITeamService
{
    public Task<ViewTeamDto> CreateTeamAsync(CreateTeamDto dto);
    public Task<ViewTeamDto> AddMembersToTeamAsync(AddMembersToTeamDto dto);

    public Task<bool?> RemoveMemberAsync(int teamId, int memberId);
    public Task<bool?> DeleteTeamAsync(int teamId);
}