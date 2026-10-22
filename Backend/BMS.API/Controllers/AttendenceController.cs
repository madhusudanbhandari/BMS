using System.Net.NetworkInformation;
using System.Security.Claims;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendenceController : ControllerBase
{
    private readonly IAttendenceService _attendenceService;

    public AttendenceController(IAttendenceService attendenceService)
    {
        _attendenceService=attendenceService;
    }

    [HttpPost("attend")]
    public async Task<IActionResult> Attend()
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var attendence=await _attendenceService.AttendAsync(userId);

        return Ok(attendence);
    }

    [HttpGet("attendence/user")]
    public async Task<IActionResult> ViewMyAttendence()
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var attendences=await _attendenceService.ViewMyAttendences(userId);

        return Ok(attendences);
    }
}