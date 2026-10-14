using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BMS.Domain.Entities.Enums;

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


        [Authorize(Roles = "HR")]
        [HttpGet("view-all-requests")]
        
        public async Task<IActionResult> GetAllSalaryRequests(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null)
        {
            var hrClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(hrClaim, out int hrId))
                return Unauthorized();

            SalaryStatus? salaryStatus = null;

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<SalaryStatus>(
                        status, true, out var parsedStatus) ||
                    !Enum.IsDefined(typeof(SalaryStatus), parsedStatus))
                {
                    return BadRequest(new
                    {
                        message = "Invalid salary status."
                    });
                }

                salaryStatus = parsedStatus;
            }

            var result = await _salaryService.ViewAllSalaryRequests(
                hrId, page, pageSize, salaryStatus);

            return Ok(result);
        }

    [Authorize(Roles ="Employee")]
    [HttpGet("get-my-salaries")]
    public async Task<IActionResult> ViewAllMyRequests()
    {
        var emp=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(emp,out int empId))
        {
            return Unauthorized();
        }

        var salaries=await _salaryService.ViewAllMySalaries(empId);
        return Ok(salaries);
    }




}