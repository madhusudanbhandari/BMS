using Microsoft.AspNetCore.Mvc;
using BMS.Application.Interface;
using BMS.Application.Dtos;
namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class OrganizationController : ControllerBase
{
    private readonly IOrgService _orgService;

    public OrganizationController(IOrgService orgService)
    {
        _orgService=orgService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync(RegisterRequest request)
    {
        var registered=await _orgService.RegisterAsync(request);
        return Ok(registered);
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync(LoginRequest request)
    {
        var logger=await _orgService.LoginAsync(request);
        return Ok(logger);
    }
    
}