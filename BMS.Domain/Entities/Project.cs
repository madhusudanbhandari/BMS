namespace BMS.Domain.Entities;


public class Project
{
    public int Id{get;set;}
    public string Name{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;

    public int OrganizationId{get;set;}
    public Organization Organization{get;set;}=null!;
    
    public ICollection<TaskItem> TaskItems{get;set;}=new List<TaskItem>();
}