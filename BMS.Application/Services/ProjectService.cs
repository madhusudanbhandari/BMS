using System.Text.RegularExpressions;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository=projectRepository;
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


}