namespace BMS.Domain.Entities;

public class Organization
{
    public Guid Id{get;set;}
    public string Name{get;set;}=string.Empty;
    public DateTime CreatedAt{get;set;}
    public ICollection<User> Users{get;set;}=new List<User>();
    public ICollection<Team> Teams{get;set;}=new List<Team>();
    public ICollection<Project> Projects{get;set;}=new List<Project>();
}