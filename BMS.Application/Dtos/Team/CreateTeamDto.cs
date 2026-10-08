namespace BMS.Domain.Entities;

public class CreateTeamDto
{
    public string Name{get;set;}=string.Empty;
    public int OrganizationId{get;set;}
    public Organization Organization{get;set;}=null!;
    public ICollection<User> Members{get;set;}=new List<User>();
}