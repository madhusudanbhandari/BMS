using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;
    public ProjectController(IProjectService projectService)
    {
        _projectService=projectService;
    }

    [Authorize(Roles ="Manager,OrganizationAdmin")]
    [HttpPost("create-project")]
    public async Task<IActionResult> CreateProject(CreateProjectDto dto)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int id);

        var project=await _projectService.CreateProjectAsync(id,dto);
        return Ok(project);
    }

    [HttpGet("view-project")]
    public async Task<IActionResult> ViewProject(int projId)
    {

        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int id);

        var project=await _projectService.ViewProjectByIdAsync(id,projId);

        return Ok(project);
    }

    [HttpGet("view-all-projects")]
    public async Task<IActionResult> ViewAllProjects(int orgId)
    {
        
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int id);

        var projects=await _projectService.ViewAllProjectsAsync(id,orgId);

        return Ok(projects);
    }

    [Authorize(Roles ="Manager,OrganizationAdmin")]
    [HttpPatch("update-project")]
    public async Task<IActionResult> UpdateProjectAsync(int projId,UpdateProjectDto dto)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int id);

        var updated=await _projectService.UpdateProjectAsync(id,projId,dto);
        return Ok(updated);
    }

    [Authorize(Roles ="Manager,OrganizationAdmin")]
    [HttpDelete("delete-project")]
    public async Task<IActionResult> DeleteProjectAsync(int projId)
    {
        
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int id);

        var deleted=await _projectService.DeleteProjectAsync(id,projId);
        return Ok(deleted);
    }

    [Authorize(Roles ="Manager, OrganizationAdmin")]
    [HttpPost("assign-team")]
    public async Task<IActionResult> AssignTeam(AssignTeamDto dto)
    {
        var requestedId=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(requestedId,out int reqId);

        var assigned=await _projectService.AssignTeamAsync(reqId,dto);

        return Ok(assigned);
    }
}