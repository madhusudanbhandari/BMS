using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class TaskItem
{
    public Guid Id{get;set;}
    public string Title{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;

    public TaskStat Status{get;set;}
    public TaskPriorities Priority{get;set;}

    public DateTime? DueDate{get;set;}
    public Guid ProjectId{get;set;}
    public Project Project{get;set;}=null!;

    public Guid? AssignedToUserId{get;set;}
    public User? AssignedToUser{get;set;}





}