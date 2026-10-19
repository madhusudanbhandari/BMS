using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TaskItemController : ControllerBase
{
    private readonly ITaskItemService _taskItemService;

    public TaskItemController(ITaskItemService taskItemService)
    {
        _taskItemService=taskItemService;
    }

    [Authorize(Roles ="Manager,OrganizationAdmin")]
    [HttpPost("create-taskItem")]
    public async Task<IActionResult> CreateTaskItemAsync(CreateTaskItemDto dto)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);

        int.TryParse(requester, out int id);
        var taskItem=await _taskItemService.CreateTaskItemAsync(id,dto);
        return Ok(taskItem);

    }
    
    [Authorize(Roles ="Manager,OrganizationAdmin")]
    [HttpPatch("update-taskItem")]
    public async Task<IActionResult> UpdateTaskItemAsync(int id, UpdateTaskItemDto dto)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int reqid);

        var taskItem=await _taskItemService.UpdateTaskItemAsync(reqid,id, dto);

        return Ok(taskItem);
    }

    [Authorize(Roles ="Manager,OrganizationAdmin,Employee")]
    [HttpPatch("update-taskItemStatus")]
    public async Task<IActionResult> UpdateTaskItemStatusAsync(int id, UpdateStatusDto dto)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(!int.TryParse(requester,out int reqid))
        {
            return Unauthorized();
        }

        var taskItem=await _taskItemService.UpdateTaskItemStatus(reqid,id, dto);

        return Ok(taskItem);
    }

    [Authorize(Roles ="Employee")]
    [HttpGet("employee-taskItems")]
    public async Task<IActionResult> ViewEmployeeTaskItems()
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var taskItems=await _taskItemService.ViewEmployeeTaskItems(userId);
        
        return Ok(taskItems);
    }

    [HttpGet("taskItem/{id}")]
    public async Task<IActionResult> ViewTaskItemAsync(int id)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int reqid);

        var taskId=await _taskItemService.ViewTaskItemAsync(reqid,id);
        return Ok(taskId);
    }

    [HttpGet("taskItems")]
    public async Task<IActionResult> ViewAllTaskItemsAsync(int projId)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int reqid);

        var taskItems=await _taskItemService.ViewAllTaskItems(reqid,projId);

        return Ok(taskItems);
    }

    [HttpDelete("delete-taskItems")]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        var requester=User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(requester,out int reqid);

        var deleted=await _taskItemService.DeleteTaskItemAsync(reqid,id);
        return Ok(deleted);
    }


}