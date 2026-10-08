using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class TaskItem
{
    public int Id{get;set;}
    public string Title{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;

    public TaskStat Status{get;set;}
    public TaskPriorities Priority{get;set;}

    public DateTime? DueDate{get;set;}
    public int ProjectId{get;set;}
    public Project Project{get;set;}=null!;

    public int? AssignedToUserId{get;set;}
    public User? AssignedToUser{get;set;}





}