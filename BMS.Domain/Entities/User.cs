using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class User
{
    public int Id{get;set;}
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public string Password{get;set;}=string.Empty;
    public UserRoles Role{get;set;}
    public int OrganizationId{get;set;}
    public Organization Organization{get;set;}=null!;

    public UserStatus Status{get;set;}
    public ICollection<Team> Teams{get;set;}=new List<Team>();

}