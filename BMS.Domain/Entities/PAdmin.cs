namespace BMS.Domain.Entities.Enums;

public class PAdmin
{
    public Guid Id{get;set;}
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public string Password{get;set;}=string.Empty;
    public UserRoles Role{get;set;}=UserRoles.PlatformAdmin;
}