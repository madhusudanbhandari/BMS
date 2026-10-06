namespace BMS.Application.Dtos;


public class AuthResponse
{
    public string Token{get;set;}=string.Empty;
    public Guid UserId{get;set;}
    public Guid OrganizationId{get;set;}
    public string Role{get;set;}=string.Empty;
}