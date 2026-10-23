using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;

    public LeaveController(ILeaveService leaveService)
    {
        _leaveService=leaveService;
    }

    [HttpPost("apply-leave")]
    public async Task<IActionResult> ApplyLeaveAsync(ApplyLeaveDto dto)
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var applied=await _leaveService.ApplyLeaveAsync(userId,dto);

        return Ok(applied);
    }

    [Authorize(Roles ="HR, Employee,Manager")]
    [HttpGet("view-leave-byId")]
    public async Task<IActionResult> ViewLeaveById(int leaveId)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(requester,out int reqId))
        {
            return  Unauthorized();
        }
        var leave=await _leaveService.ViewLeaveById(reqId,leaveId);

        return Ok(leave);
    }

    [HttpGet("view-employee-leaves")]
    public async Task<IActionResult> ViewEmployeeLeaves(int empId)
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }
        var leaves=await _leaveService.ViewEmployeeLeaves(userId,empId);

        return Ok(leaves);
    }

    [Authorize(Roles ="HR")]
    [HttpPatch("Update-leave")]
    public async Task<IActionResult> UpdateLeaveAsync(int leaveId,UpdateLeaveDto dto)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(requester,out int reqId))
        {
            return Unauthorized();
        }
        var updated=await _leaveService.UpdateLeaveAsync(reqId,leaveId,dto);

        return Ok(updated);
    }

    [Authorize(Roles ="HR")]
    [HttpGet("view-all-leaves")]
    public async Task<IActionResult> ViewAllOrgLeaves()
    {
        var userClaim=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(userClaim,out int userId))
        {
            return Unauthorized();
        }

        var leaves=await _leaveService.ViewOrganizationsLeaves(userId);

        return Ok(leaves);
    }


}