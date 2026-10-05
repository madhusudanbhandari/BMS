using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class User
{
    public Guid Id{get;set;}
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public string PasswordHash{get;set;}=string.Empty;
    public UserRoles Role{get;set;}
    public Guid OrganizationId{get;set;}
    public Organization Organization{get;set;}=null!;

}