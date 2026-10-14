using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class SalaryController : ControllerBase
{
    private readonly ISalaryService _salaryService;
    public SalaryController(ISalaryService salaryService)
    {
        _salaryService=salaryService;
    }

    [Authorize]
    [HttpPost("request-salary")]
    public async Task<IActionResult> RequestSalary([FromBody] RequestSalaryDto dto)
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int hrId))
        {
            return Unauthorized();
        }
        var requested=await _salaryService.RequestSalaryAsync(hrId,dto);

        return Ok(requested);
    }

    [Authorize(Roles ="HR")]
    [HttpPatch("update-salary")]

    public async Task<IActionResult> UpdateSalaryAsync([FromQuery]int empId,[FromQuery]int salaryId,[FromBody]UpdateSalaryDto dto)
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int hrId))
        {
            return Unauthorized();
        }

        var updated=await _salaryService.UpdateSalaryAsync( hrId, empId, salaryId, dto);

        return Ok(updated);
    }
    


}