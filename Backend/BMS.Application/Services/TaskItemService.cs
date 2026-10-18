using BMS.Application.Dtos;
using BMS.Application.Exceptions;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class TaskItemService : ITaskItemService
{
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IAuthRepository _authRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IEventNotificationService _eventNotificationService;
    
    public TaskItemService(ITaskItemRepository taskItemRepository,
                            IAuthRepository authRepository,
                            ITeamRepository teamRepository,
                            IProjectRepository projectRepository,
                            IEventNotificationService eventNotificationService)
    {
        _taskItemRepository=taskItemRepository;
        _authRepository=authRepository;
        _teamRepository=teamRepository;
        _projectRepository=projectRepository;
        _eventNotificationService=eventNotificationService;
    }


    public async Task<ViewTaskItemDto> CreateTaskItemAsync(int reqId,CreateTaskItemDto dto)
    {
        var requester=await _authRepository.GetUserByIdAsync(reqId);

        if (requester == null)
        {
            throw new Exception("Cannot find the user");
        }

        var reqOrg=requester.OrganizationId;

        var project=await _projectRepository.GetProjectByIdAsync(dto.ProjectId);
        if (project == null)
        {
            throw new Exception("Cannot find the project");
        }

        var projOrg=project.OrganizationId;

        if (reqOrg != projOrg)
        {
            throw new Exception("You cannot create the taskItem for others project");
        }

        // if(dto.AssignedToUserId is not int assignedUserId)
        // {
        //     throw new NotFoundException("cannot find the user");
        // }

        if (dto.AssignedToUserId == null)
        {
            throw new NotFoundException("cannot find user");
        }

        var assignedUser=await _authRepository.GetUserByIdAsync(dto.AssignedToUserId.Value);

        if (assignedUser == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var assignedUserOrg=assignedUser.OrganizationId;

        if (assignedUserOrg != projOrg)
        {
            throw new BadRequestException("used does not belong to same organization");
        }

       var taskItem=new TaskItem
       {
           Title=dto.Title,
           Description=dto.Description,
           Status=dto.Status,
           Priority=dto.Priority,
           DueDate=dto.DueDate,
           ProjectId=project.Id,
           AssignedToUserId=dto.AssignedToUserId

       } ;

        if (assignedUser != null)
        {
            _eventNotificationService.Record(
                actorUserId:reqId,
                targetUserId:assignedUser.Id,
                organizationId:assignedUser.OrganizationId,
                title:"assigned task",
                message:$"{assignedUser.Id} assigned a task {taskItem}",
                description:$"{assignedUser.FirstName} is assigned a task {taskItem.Title}",
                relatedEntityType:"TaskItem",
                relatedEntityId:taskItem.Id
            );
        }

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

    public async Task<ViewTaskItemDto> UpdateTaskItemAsync(int requesterId,int taskId, UpdateTaskItemDto dto)
    {
        
        var taskItem=await _taskItemRepository.GetTaskItemByIdAsync(taskId);
        if (taskItem == null)
        {
            throw new Exception("Cannot find the task Item");
        }

        var project=taskItem.Project;
        var orgId=project.OrganizationId;

        var user=await _authRepository.GetUserByIdAsync(requesterId);
        if (user == null)
        {
            throw new Exception("cannot find the user");
        }
        var userOrg=user.OrganizationId;

        if (orgId != userOrg)
        {
            throw new InvalidOperationException("You cant control this item");
        }
        
        var newProject=await _projectRepository.GetProjectByIdAsync(dto.ProjectId);

        if(newProject==null || newProject.OrganizationId != orgId)
        {
            throw new UnauthorizedAccessException("You cannot control this taskItem");
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

    public async Task<ViewTaskItemDto?> ViewTaskItemAsync(int requesterId,int taskId)
    {
        var taskItem=await _taskItemRepository.GetTaskItemByIdAsync(taskId);

        if (taskItem == null)
        {
            throw new Exception("Cannot find the item");
        }

        var project=taskItem.Project;
        var orgId=project.OrganizationId;

        var user=await _authRepository.GetUserByIdAsync(requesterId);
        if (user == null)
        {
            throw new Exception("cannot find the user");
        }
        var userOrg=user.OrganizationId;

        if (orgId != userOrg)
        {
            throw new InvalidOperationException("You cant control this item");
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

    public async Task<List<ViewTaskItemDto>> ViewAllTaskItems(int requesterId,int projId)
    {

        var project=await _projectRepository.GetProjectByIdAsync(projId);

        if (project == null)
        {
            throw new Exception("Cannot find the project");
        }

        var projOrg=project.OrganizationId;

        var user=await _authRepository.GetUserByIdAsync(requesterId);

        if (user == null)
        {
            throw new Exception("Cannot find the userId");
        }

        var reqOrg=user.OrganizationId;

        if (projOrg != reqOrg)
        {
            throw new Exception("You cannot view the projects of this organization");
        }

        var taskItems=await _taskItemRepository.GetTaskItemsAsync(project.Id);




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

    public async Task<bool?> DeleteTaskItemAsync(int requesterId,int id)
    {


        var item=await _taskItemRepository.GetTaskItemByIdAsync(id);

        if (item == null)
        {
            throw new Exception("Cannot find the item");
        }

        var project=item.Project;
        var orgId=project.OrganizationId;

        var user=await _authRepository.GetUserByIdAsync(requesterId);
        if (user == null)
        {
            throw new Exception("cannot find the user");
        }
        var userOrg=user.OrganizationId;

        if (orgId != userOrg)
        {
            throw new InvalidOperationException("You cant control this item");
        }

        await _taskItemRepository.RemoveTaskItem(item);
        await _taskItemRepository.SaveChangesAsync();

        return true;
    }

}