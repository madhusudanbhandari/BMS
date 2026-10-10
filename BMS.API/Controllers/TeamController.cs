using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;   
    public TeamController(ITeamService teamService)
    {
        _teamService=teamService;
    }


    [Authorize(Roles ="OrganizationAdmin")]
    [HttpPost("create-team")]
    public async Task<IActionResult> CreateTeamAsync(CreateTeamDto dto)
    {
        var admin=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(admin, out int adminId);

        var team=await _teamService.CreateTeamAsync(adminId,dto);

        return Ok(team);
    }

    [Authorize]
    [HttpGet("view-teams")]
    public async Task<IActionResult> ViewTeamsAsync()
    {
        var member=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(member,out int memberId);

        var teams=await _teamService.ViewAllTeamsAsync(memberId);

        return Ok(teams);
    }

    [Authorize(Roles ="OrganizationAdmin")]
    [HttpPost("add-member")]
    public async Task<IActionResult> AdddMemberAsync(AddMembersToTeamDto dto)
    {

        var admin=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(admin, out int adminId);

        var member=await _teamService.AddMembersToTeamAsync(adminId,dto);

        return Ok(member);
    }

    [Authorize(Roles ="OrganizationAdmin")]
    [HttpPost("remove-member")]
    public async Task<IActionResult> RemoveMemberAsync(int teamId, int userId)
    {

        var admin=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(admin, out int adminId);

        var removed=await _teamService.RemoveMemberAsync(adminId,teamId,userId);
        
        return Ok(removed);
    }

    [Authorize(Roles ="OrganizationAdmin")]
    [HttpDelete("delete-team")]
    public async Task<IActionResult> DeleteMemberAsync(int teamId)
    {

        var admin=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(admin, out int adminId);

        var deleted=await _teamService.DeleteTeamAsync(adminId,teamId);

        return Ok(deleted);
    }
}