using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService=adminService;
    }

    [Authorize(Roles ="OrganizationAdmin")]
    [HttpGet("view-pending-users")]
    public async Task<IActionResult> ViewPendingUsersAsync()
    {
        var admin=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(admin, out int adminId);

        var users= await _adminService.ViewAllPendingUsersAsync(adminId);

        return Ok(users);
    }

    [Authorize(Roles ="OrganizationAdmin")]
    [HttpPatch("verify-users")]
    public async Task<IActionResult> VerifyPendingUsersAsync(VerifyUserDto dto)
    {

        var admin=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(admin, out int adminId);

        var users= await _adminService.VerifyUserRequest(adminId,dto);

        return Ok(users);
    }
}