using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    public TeamService(
        ITeamRepository teamRepository
    )
    {
        _teamRepository=teamRepository;
    }

    public async Task<ViewTeamDto> CreateTeamAsync(CreateTeamDto dto)
    {
        var team=new Team
        {
            Name=dto.Name,
            OrganizationId=dto.OrganizationId,

        };

        await _teamRepository.AddTeamAsync(team);
        await _teamRepository.SaveChangesAsync();

        var viewTeamDto=new ViewTeamDto
        {
            Id=team.Id,
            Name=team.Name,
            OrganizationId=team.OrganizationId,

            Members=team.Members.Select(user=>new TeamMemberDto
            {
                Id=user.Id,
                FirstName=user.FirstName,
                LastName=user.LastName,
                Email=user.Email,
                organizationId=user.OrganizationId,
                Role=user.Role
            }).ToList()
        };

        return viewTeamDto;
    }

    public async Task<ViewTeamDto> AddMembersToTeamAsync(AddMembersToTeamDto dto)
    {
        var team=await _teamRepository.GetTeamAsync(dto.TeamId);

        if (team == null)
        {
            throw new Exception("Team does not exists");
        }

        var user=await _teamRepository.GetUserAsync(dto.UserId);

        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (user.OrganizationId != team.OrganizationId)
        {
            throw new InvalidOperationException("user and team must belong to same organization");
        }

        if (team.Members.Any(m => m.Id == user.Id))
        {
            throw new Exception("User is already member of this team");
        }

        team.Members.Add(user);
        await _teamRepository.SaveChangesAsync();

        var viewTeamDto=new ViewTeamDto
        {
            Id=team.Id,
            Name=team.Name,
            OrganizationId=team.OrganizationId,

            Members=team.Members.Select(user=>new TeamMemberDto
            {
                Id=user.Id,
                FirstName=user.FirstName,
                LastName=user.LastName,
                Email=user.Email,
                organizationId=user.OrganizationId,
                Role=user.Role
            }).ToList()
        };

        return viewTeamDto;    
    }

    public async Task<bool?> RemoveMemberAsync(int teamId, int memberId)
        {
        var team=await _teamRepository.GetTeamAsync(teamId);

        if (team == null)
        {
            throw new Exception("Team does not exists");
        }

        var user=await _teamRepository.GetUserAsync(memberId);

        if (user == null)
        {
            throw new Exception("User  does not exists");
        }

        if (user.OrganizationId != team.OrganizationId)
        {
            throw new InvalidOperationException("user and team must belong to same organization");
        }

        if (!team.Members.Any(m => m.Id == user.Id))
        {
            throw new Exception("User is not member of this team");
        }

        team.Members.Remove(user);
        await _teamRepository.SaveChangesAsync();


        return true;
    }


    public async Task<bool?> DeleteTeamAsync(int teamId)
    {
        var team=await _teamRepository.GetTeamAsync(teamId);

        if (team == null)
        {
            throw new Exception("Team does not exists");
        }

        await _teamRepository.RemoveTeamAsync(team);

        return true;
    }


}