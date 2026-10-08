using Microsoft.AspNetCore.Mvc;
using BMS.Application.Interface;
using BMS.Application.Dtos;
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

    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync(RegisterRequest request)
    {
        var registered=await _authService.RegisterAsync(request);
        return Ok(registered);
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync(LoginRequest request)
    {
        var logger=await _authService.LoginAsync(request);
        return Ok(logger);
    }
    
}