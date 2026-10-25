using System.Text.RegularExpressions;
using AutoMapper;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IAuthRepository _authRepository;
    private readonly IMapper _mapper;

    public ProjectService(IProjectRepository projectRepository,
                            ITeamRepository teamRepository,
                            IAuthRepository authRepository,
                            IMapper mapper)
    {
        _projectRepository=projectRepository;
        _teamRepository=teamRepository;
        _authRepository=authRepository;
        _mapper=mapper;
    }

    public async Task<ViewProjectDto> CreateProjectAsync(int requesterId,CreateProjectDto dto)
    {
        var requester=await _authRepository.GetUserByIdAsync(requesterId);
        if (requester == null)
        {
            throw new Exception("Cannot find the user");
        }

        var orgId=requester.OrganizationId;

        var project=new Project
        {
            Name=dto.Name,
            Description=dto.Description,
            projectStatus=Domain.Entities.enums.ProjectStatus.Pending,
            OrganizationId=orgId,
            
        };

        await _projectRepository.AddProjectAsync(project);
        await _projectRepository.SaveChangesAsync();

        return _mapper.Map<ViewProjectDto>(project);
    }

    public async Task<ViewProjectDto?> ViewProjectByIdAsync(int requesterId,int projId)
    {
        var requester=await _authRepository.GetUserByIdAsync(requesterId);
        if (requester == null)
        {
            throw new Exception("Cannot find the user");
        }

        var orgId=requester.OrganizationId;

        var project=await _projectRepository.GetProjectByIdAsync(projId);

        if (project == null)
        {
            throw new Exception("Cannot find the project");
        }

        var projOrg=project.OrganizationId;

        if (orgId != projOrg)
        {
            throw new Exception("You cannot control this organization");
        }

        return _mapper.Map<ViewProjectDto>(project);
    }

    public async Task<List<ViewProjectDto>> ViewAllProjectsAsync(int requesterId,int orgId)
    {
        var requester=await _authRepository.GetUserByIdAsync(requesterId);
        if (requester == null)
        {
            throw new Exception("Cannot find the user");
        }

        var reqOrg=requester.OrganizationId;



        if (orgId != reqOrg)
        {
            throw new Exception("You cannot control this organization");
        }
        var projects=await _projectRepository.GetAllProjectsAsync(orgId);

        return _mapper.Map<List<ViewProjectDto>>(projects);
    }

    public async Task<ViewProjectDto?> UpdateProjectAsync(int requesterId,int projId, UpdateProjectDto dto)
    {
        var requester=await _authRepository.GetUserByIdAsync(requesterId);

        if (requester == null)
        {
            throw new Exception("User is null");
        }

        var orgId=requester.OrganizationId;


        var project=await _projectRepository.GetProjectByIdAsync(projId);

        if (project == null)
        {
            throw new Exception("Project Does not exists");
        }

        var projOrg=project.OrganizationId;
        if (orgId != projOrg)
        {
            throw new Exception("You cannot control this organization");
        }

        project.Name=dto.Name;
        project.projectStatus=dto.projectStatus;
        project.Description=dto.Description;

        await _projectRepository.SaveChangesAsync();

        return _mapper.Map<ViewProjectDto>(project);
    }

    public async Task<bool?> DeleteProjectAsync(int requesterId,int projId)
    {
        var requester=await _authRepository.GetUserByIdAsync(requesterId);

        if (requester == null)
        {
            throw new Exception("User is null");
        }

        var orgId=requester.OrganizationId;

        var project=await _projectRepository.GetProjectByIdAsync(projId);
        if (project == null)
        {
            throw new Exception("Cannot find the project");
        }
        var projOrg=project.OrganizationId;

        if (orgId != projOrg)
        {
            throw new Exception("You cant control this organization");
        }

        await _projectRepository.RemoveProjectAsync(project);
        await _projectRepository.SaveChangesAsync();

        return true;
    }

    public async Task<ViewProjectDto> AssignTeamAsync(int reqId,AssignTeamDto dto)
    {
        var project=await _projectRepository.GetProjectByIdAsync(dto.ProjectId);

        if (project == null)
        {
            throw new Exception("Cannot find the project");
        }
        var team=await _teamRepository.GetTeamAsync(dto.TeamId);

        if (team == null)
        {
            throw new Exception("cannot find the team");
        }

        if (project.OrganizationId != team.OrganizationId)
        {
            throw new Exception("they dont belong to same organization");
        }

        var user=await _authRepository.GetUserByIdAsync(reqId);
        if (user == null)
        {
            throw new Exception("cannot find the user");
        }

        if (user.OrganizationId != project.OrganizationId)
        {
            throw new Exception("They belong to different organization");
        }

        project.TeamId=dto.TeamId;
        project.projectStatus=Domain.Entities.enums.ProjectStatus.Assigned;

        await _projectRepository.SaveChangesAsync();

        return _mapper.Map<ViewProjectDto>(project);

    }


}