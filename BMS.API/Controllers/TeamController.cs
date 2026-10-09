using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;   
    public TeamController(ITeamService teamService)
    {
        _teamService=teamService;
    }


    [HttpPost("create-team")]
    public async Task<IActionResult> CreateTeamAsync(CreateTeamDto dto)
    {
        var team=await _teamService.CreateTeamAsync(dto);

        return Ok(team);
    }

    [HttpPost("add-member")]
    public async Task<IActionResult> AdddMemberAsync(AddMembersToTeamDto dto)
    {
        var member=await _teamService.AddMembersToTeamAsync(dto);

        return Ok(member);
    }

    [HttpPost("remove-member")]
    public async Task<IActionResult> RemoveMemberAsync(int teamId, int userId)
    {
        var removed=await _teamService.RemoveMemberAsync(teamId,userId);
        
        return Ok(removed);
    }

    [HttpDelete("delete-team")]
    public async Task<IActionResult> DeleteMemberAsync(int teamId)
    {
        var deleted=await _teamService.DeleteTeamAsync(teamId);

        return Ok(deleted);
    }
}