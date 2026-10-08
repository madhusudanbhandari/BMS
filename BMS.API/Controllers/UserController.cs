using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService=userService;
    }

    [HttpPost("register-user")]
    public async Task<IActionResult> RegisterUserAsync(UserRegisterRequest request)
    {
        var user=await _userService.RegisterRequestAsync(request);
        return Ok(user);
    }

    [HttpPost("login-user")]
    public async Task<IActionResult> LoginUserAsync(UserLoginRequest request)
    {
        var login=await _userService.LoginRequestAsync(request);
        return Ok(login);
    }
}