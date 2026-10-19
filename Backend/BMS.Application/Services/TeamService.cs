using BMS.Application.Dtos;
using BMS.Application.Exceptions;
using BMS.Application.Interface;
using BMS.Domain.Entities;


namespace BMS.Application.Service;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    private readonly IAuthRepository _authRepository;
    private readonly IEventNotificationService _eventNotification;

    public TeamService(
        ITeamRepository teamRepository,
        IAuthRepository authRepository,
        IEventNotificationService eventNotification
    )
    {
        _teamRepository=teamRepository;
        _authRepository=authRepository;
        _eventNotification=eventNotification;
    }

    
    public async Task<ViewTeamDto> CreateTeamAsync(int adminId,CreateTeamDto dto)
    {

        var admin=await _authRepository.GetUserByIdAsync(adminId);
        
        if(admin==null)
        {
            throw new NotFoundException("Admin does not exists");
        };

        var organization=admin.OrganizationId;
    
        var team=new Team
        {
            Name=dto.Name,
            OrganizationId=organization,

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

        var member=await _authRepository.GetUserByIdAsync(memberId);
        
        if (member == null)
        {
            throw new NotFoundException("User does not exists");
        }

        var orgId=member.OrganizationId;


        var teams=await _teamRepository.ViewOrgTeamsAsync(orgId);

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

    public async Task<List<ViewTeamDto>> ViewMyTeamsAsync(int memberId)
    {
        var teams=await _teamRepository.ViewEmpTeamsAsync(memberId);

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

        var admin=await _authRepository.GetUserByIdAsync(adminId);

        var adminOrganization=admin?.OrganizationId;

        var team=await _teamRepository.GetTeamAsync(dto.TeamId);

        if (team == null)
        {
            throw new NotFoundException("Team does not exists");
        }

        var user=await _teamRepository.GetUserAsync(dto.UserId);

        if (user == null)
        {
            throw new NotFoundException("User not found");
        }
        if (adminOrganization != team.OrganizationId)
        {
            throw new NotFoundException("You cannot control team of this organization ");
        }

        if (user.OrganizationId != team.OrganizationId)
        {
            throw new InvalidOperationException("user and team must belong to same organization");
        }

        if (team.Members.Any(m => m.Id == user.Id))
        {
            throw new BadRequestException("User is already member of this team");
        }

        team.Members.Add(user);

        _eventNotification.Record(
            actorUserId:adminId,
            targetUserId: user.Id,
            organizationId:user.OrganizationId,
            title:"added employee to team",
            message:$"You have been added to the team{ team.Id}",
            description:$"{user.FirstName} {user.LastName} added to the team{team.Id}",
            relatedEntityType:"Team",
            relatedEntityId:team.Id
        );
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

        var admin=await _authRepository.GetUserByIdAsync(adminId);
        var orgId=admin?.OrganizationId;

        var team=await _teamRepository.GetTeamAsync(teamId);

        if (team == null)
        {
            throw new NotFoundException("Team does not exists");
        }

        var user=await _teamRepository.GetUserAsync(memberId);

        if (user == null)
        {
            throw new NotFoundException("User  does not exists");
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

        _eventNotification.Record(
            actorUserId:adminId,
            targetUserId: user.Id,
            organizationId:user.OrganizationId,
            title:"removed employee from team",
            message:$"You have been removed from the team{ team.Id}",
            description:$"{user.FirstName} {user.LastName} removed from the team{team.Id}",
            relatedEntityType:"Team",
            relatedEntityId:team.Id
        );

        await _teamRepository.SaveChangesAsync();


        return true;
    }


    public async Task<bool?> DeleteTeamAsync(int adminId,int teamId)
    {
        var admin=await _authRepository.GetUserByIdAsync(adminId);

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