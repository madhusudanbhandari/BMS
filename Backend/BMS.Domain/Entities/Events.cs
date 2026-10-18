namespace BMS.Domain.Entities;

public class ActivityEvent
{
    public int Id{get;set;}
    public string Title{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;
    public int ActorUser{get;set;}
    public int? TargetUser{get;set;}
    public int OrganizationId{get;set;}
    public DateTime CreatedAt{get;set;}=DateTime.UtcNow;

    public string? RelatedEntity{get;set;}=string.Empty;
    public int? RelatedEntityId{get;set;}

    public ICollection<Notification> Notifications{get;set;}=new List<Notification>();
}