using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Infrastructure.Repository;
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

    [Authorize("Manager")]
    [HttpPost("create-taskItem")]
    public async Task<IActionResult> CreateTaskItemAsync(CreateTaskItemDto dto)
    {
        var taskItem=await _taskItemService.CreateTaskItemAsync(dto);
        return Ok(taskItem);

    }
    
    
    [HttpPatch("update-taskItem")]
    public async Task<IActionResult> UpdateTaskItemAsync(int id, UpdateTaskItemDto dto)
    {
        var taskItem=await _taskItemService.UpdateTaskItemAsync(id, dto);

        return Ok(taskItem);
    }

    [HttpGet("taskItem/{id}")]
    public async Task<IActionResult> ViewTaskItemAsync(int id)
    {
        var taskId=await _taskItemService.ViewTaskItemAsync(id);
        return Ok(taskId);
    }

    [HttpGet("taskItems")]
    public async Task<IActionResult> ViewAllTaskItemsAsync(int projId)
    {
        var taskItems=await _taskItemService.ViewAllTaskItems(projId);

        return Ok(taskItems);
    }

    [HttpDelete("delete-taskItems")]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        var deleted=await _taskItemService.DeleteTaskItemAsync(id);
        return Ok(deleted);
    }


}