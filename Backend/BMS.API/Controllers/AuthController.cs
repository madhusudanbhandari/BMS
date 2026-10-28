using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService=authService;
    }

    [AllowAnonymous]
    [HttpPost("register-user")]
    public async Task<IActionResult> RegisterUserAsync(UserRegisterRequest request)
    {
        var user=await _authService.RegisterRequestAsync(request);
        return Ok(user);
    }

    [EnableRateLimiting("LoginRateLimit")]
    [AllowAnonymous]
    [HttpPost("login-user")]
    public async Task<IActionResult> LoginUserAsync(UserLoginRequest request)
    {
        var login=await _authService.LoginRequestAsync(request);
        return Ok(login);
    }

    [Authorize]
    [HttpPatch("update-user")]
    public async Task<IActionResult> UpdateUserAsync(string targetUserEmail,UpdateUserDto dto)
    {
        var requestedUserEmail=User.FindFirstValue(ClaimTypes.Email);

        if (requestedUserEmail == null)
        {
            throw new Exception("User does not exists");
        }
        
        var updated=await _authService.UpdateUserAsync(requestedUserEmail,targetUserEmail, dto);

        return Ok(updated);
    }

    [HttpGet("organization-employees")]
    public async Task<IActionResult> ViewOrgEmployees()
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user, out int userId))
        {
            return Unauthorized();
        }

        var employees=await _authService.ViewOrganizationEmployees(userId);

        return Ok(employees);
    }

    [Authorize]
    [HttpDelete("delete-user")]
    public async Task<IActionResult> DeleteUserAsync(string targetUserEmail)
    {
        var requestedUserEmail=User.FindFirstValue(ClaimTypes.Email);

        if (requestedUserEmail == null)
        {
            throw new Exception("User does not exists");
        }

        var deleted=await _authService.DeleteUserAsync(requestedUserEmail,targetUserEmail);

        return Ok(deleted);
    }
}