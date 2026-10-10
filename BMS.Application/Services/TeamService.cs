using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    private readonly IUserRepository _userRepository;
    public TeamService(
        ITeamRepository teamRepository,
        IUserRepository userRepository
    )
    {
        _teamRepository=teamRepository;
        _userRepository=userRepository;
    }

    
    public async Task<ViewTeamDto> CreateTeamAsync(int adminId,CreateTeamDto dto)
    {

        var admin=await _userRepository.GetUserByIdAsync(adminId);
        
        var organization=admin?.OrganizationId;

        if (organization != dto.OrganizationId)
        {
            throw new Exception("You cannot control team of this organization");
        }

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
    public async Task<List<ViewTeamDto>> ViewAllTeamsAsync(int memberId)
    {

        var member=await _userRepository.GetUserByIdAsync(memberId);
        
        if (member == null)
        {
            throw new Exception("User does not exists");
        }

        var orgId=member.OrganizationId;


        var teams=await _teamRepository.ViewTeamsAsync(orgId);

        return teams.Select(team=>new ViewTeamDto
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
        }).ToList();
    }

    public async Task<ViewTeamDto> AddMembersToTeamAsync(int adminId,AddMembersToTeamDto dto)
    {

        var admin=await _userRepository.GetUserByIdAsync(adminId);

        var adminOrganization=admin?.OrganizationId;

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
        if (adminOrganization != team.OrganizationId)
        {
            throw new Exception("You cannot control team of this organization ");
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

    public async Task<bool?> RemoveMemberAsync(int adminId,int teamId, int memberId)
        {

        var admin=await _userRepository.GetUserByIdAsync(adminId);
        var orgId=admin?.OrganizationId;

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
        if (orgId != team.OrganizationId)
        {
            throw new Exception("You cannot control the teams of this organization");
        }


        if (!team.Members.Any(m => m.Id == user.Id))
        {
            throw new Exception("User is not member of this team");
        }

        team.Members.Remove(user);
        await _teamRepository.SaveChangesAsync();


        return true;
    }


    public async Task<bool?> DeleteTeamAsync(int adminId,int teamId)
    {
        var admin=await _userRepository.GetUserByIdAsync(adminId);

        var orgId=admin?.OrganizationId;

        var team=await _teamRepository.GetTeamAsync(teamId);

        if (team == null)
        {
            throw new Exception("Team does not exists");
        }

        if (orgId != team?.OrganizationId)
        {
            throw new Exception("you cannot control the teams of this organization");
        }

       

        await _teamRepository.RemoveTeamAsync(team);
        await _teamRepository.SaveChangesAsync();

        return true;
    }


}