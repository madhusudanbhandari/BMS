using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;


public class UpdateUserDto
{
    
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public string Password{get;set;}=string.Empty;
    public UserRoles UserRoles{get;set;}
    public int OrganizationId{get;set;}
}