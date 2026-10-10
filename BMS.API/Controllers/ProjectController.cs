using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;
    public ProjectController(IProjectService projectService)
    {
        _projectService=projectService;
    }

    [HttpPost("create-project")]
    public async Task<IActionResult> CreateProject(CreateProjectDto dto)
    {
        var project=await _projectService.CreateProjectAsync(dto);
        return Ok(project);
    }

    [HttpGet("view-project")]
    public async Task<IActionResult> ViewProject(int projId)
    {
        var project=await _projectService.ViewProjectByIdAsync(projId);

        return Ok(project);
    }

    [HttpGet("view-all-projects")]
    public async Task<IActionResult> ViewAllProjects(int orgId)
    {
        var projects=await _projectService.ViewAllProjectsAsync(orgId);

        return Ok(projects);
    }

    [HttpPatch("update-project")]
    public async Task<IActionResult> UpdateProjectAsync(int projId,UpdateProjectDto dto)
    {
        var updated=await _projectService.UpdateProjectAsync(projId,dto);
        return Ok(updated);
    }

    [HttpDelete("delete-project")]
    public async Task<IActionResult> DeleteProjectAsync(int projId)
    {
        var deleted=await _projectService.DeleteProjectAsync(projId);
        return Ok(deleted);
    }
}