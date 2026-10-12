using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class CreateTaskItemDto
{
    public string Title{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;
    public TaskStat Status{get;set;}
    public TaskPriorities Priority{get;set;}
    public DateTime? DueDate{get;set;}
    public int ProjectId{get;set;}
    public int? AssignedToUserId{get;set;}

}