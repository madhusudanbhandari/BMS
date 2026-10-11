using System.Text.RegularExpressions;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IAuthRepository _authRepository;

    public ProjectService(IProjectRepository projectRepository,ITeamRepository teamRepository,IAuthRepository authRepository)
    {
        _projectRepository=projectRepository;
        _teamRepository=teamRepository;
        _authRepository=authRepository;
    }

    public async Task<ViewProjectDto> CreateProjectAsync(CreateProjectDto dto)
    {
        var project=new Project
        {
            Name=dto.Name,
            Description=dto.Description,

            OrganizationId=dto.OrganizationId,
            
        };

        await _projectRepository.AddProjectAsync(project);
        await _projectRepository.SaveChangesAsync();

        return new ViewProjectDto
        {
            Id=project.Id,
            Name=project.Name,
            Description=project.Description,
            OrganizationId=project.OrganizationId
        };
    }

    public async Task<ViewProjectDto?> ViewProjectByIdAsync(int projId)
    {
        var project=await _projectRepository.GetProjectByIdAsync(projId);

        if (project == null)
        {
            throw new Exception("Cannot find the project");
        }

        return new ViewProjectDto
        {
            Id=project.Id,
            Name=project.Name,
            Description=project.Description,
            OrganizationId=project.OrganizationId
        }; 
    }

    public async Task<List<ViewProjectDto>> ViewAllProjectsAsync(int orgId)
    {
        var projects=await _projectRepository.GetAllProjectsAsync(orgId);

        return projects.Select(project=>new ViewProjectDto
        {
            Id=project.Id,
            Name=project.Name,
            Description=project.Description,
            OrganizationId=project.OrganizationId
        }).ToList();

    }

    public async Task<ViewProjectDto?> UpdateProjectAsync(int projId, UpdateProjectDto dto)
    {
        var project=await _projectRepository.GetProjectByIdAsync(projId);

        if (project == null)
        {
            throw new Exception("Project Does not exists");
        }

        project.Name=dto.Name;
        project.Description=dto.Description;
        project.OrganizationId=dto.OrganizationId;

        return new ViewProjectDto
        {
            Id=project.Id,
            Name=project.Name,
            Description=project.Description,
            OrganizationId=project.OrganizationId
        };
    }

    public async Task<bool?> DeleteProjectAsync(int projId)
    {
        var project=await _projectRepository.GetProjectByIdAsync(projId);

        if (project == null)
        {
            throw new Exception("Cannot find the project");
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

        await _projectRepository.SaveChangesAsync();

        return new ViewProjectDto
        {
            Id=project.Id,
            Name=project.Name,
            Description=project.Description,
            OrganizationId=project.OrganizationId
        };

    }


}