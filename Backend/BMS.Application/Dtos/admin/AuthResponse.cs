namespace BMS.Application.Dtos;


public class AuthResponse
{
    public string Token{get;set;}=string.Empty;
    public int UserId{get;set;}
    public int OrganizationId{get;set;}
    public string Role{get;set;}=string.Empty;
}