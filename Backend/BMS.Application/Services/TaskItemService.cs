using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class TaskItemService : ITaskItemService
{
    private readonly ITaskItemRepository _taskItemRepository;
    
    public TaskItemService(ITaskItemRepository taskItemRepository)
    {
        _taskItemRepository=taskItemRepository;
    }

    public async Task<ViewTaskItemDto> CreateTaskItemAsync(CreateTaskItemDto dto)
    {
       var taskItem=new TaskItem
       {
           Title=dto.Title,
           Description=dto.Description,
           Status=dto.Status,
           Priority=dto.Priority,
           DueDate=dto.DueDate,
           ProjectId=dto.ProjectId,
           AssignedToUserId=dto.AssignedToUserId

       } ;

       await _taskItemRepository.AddTaskItem(taskItem);
       await _taskItemRepository.SaveChangesAsync();

       return new ViewTaskItemDto
       {
           Id=taskItem.Id,
           Title=taskItem.Title,
           Description=taskItem.Description,
           Status=taskItem.Status,
           Priority=taskItem.Priority,
           DueDate=taskItem.DueDate,
           ProjectId=taskItem.ProjectId,
           AssignedToUserId=taskItem.AssignedToUserId
       };

    }

    public async Task<ViewTaskItemDto> UpdateTaskItemAsync(int taskId, UpdateTaskItemDto dto)
    {
        var taskItem=await _taskItemRepository.GetTaskItemByIdAsync(taskId);
        if (taskItem == null)
        {
            throw new Exception("Cannot find the task Item");
        }

        taskItem.Title=dto.Title;
        taskItem.Description=dto.Description;
        taskItem.Status=dto.Status;
        taskItem.Priority=dto.Priority;
        taskItem.DueDate=dto.DueDate;
        taskItem.ProjectId=dto.ProjectId;
        taskItem.AssignedToUserId=dto.AssignedToUserId;

        await _taskItemRepository.SaveChangesAsync();

        return new ViewTaskItemDto
       {
           Id=taskItem.Id,
           Title=taskItem.Title,
           Description=taskItem.Description,
           Status=taskItem.Status,
           Priority=taskItem.Priority,
           DueDate=taskItem.DueDate,
           ProjectId=taskItem.ProjectId,
           AssignedToUserId=taskItem.AssignedToUserId
       };
    }

    public async Task<ViewTaskItemDto?> ViewTaskItemAsync(int taskId)
    {
        var taskItem=await _taskItemRepository.GetTaskItemByIdAsync(taskId);

        if (taskItem == null)
        {
            throw new Exception("Cannot find the item");
        }
    
        return new ViewTaskItemDto
        {
            Id=taskItem.Id,
            Title=taskItem.Title,
            Description=taskItem.Description,
            Status=taskItem.Status,
            Priority=taskItem.Priority,
            DueDate=taskItem.DueDate,
            ProjectId=taskItem.ProjectId,
            AssignedToUserId=taskItem.AssignedToUserId
        };
        
    }

    public async Task<List<ViewTaskItemDto>> ViewAllTaskItems(int teamId)
    {
        var taskItems=await _taskItemRepository.GetTaskItemsAsync(teamId);

        return taskItems.Select(taskItem=>new ViewTaskItemDto
        {
            Id=taskItem.Id,
            Title=taskItem.Title,
            Description=taskItem.Description,
            Status=taskItem.Status,
            Priority=taskItem.Priority,
            DueDate=taskItem.DueDate,
            ProjectId=taskItem.ProjectId,
            AssignedToUserId=taskItem.AssignedToUserId

        }).ToList();
    }

    public async Task<bool?> DeleteTaskItemAsync(int id)
    {
        var item=await _taskItemRepository.GetTaskItemByIdAsync(id);

        if (item == null)
        {
            throw new Exception("Cannot find the item");
        }

        await _taskItemRepository.RemoveTaskItem(item);
        await _taskItemRepository.SaveChangesAsync();

        return true;
    }

}