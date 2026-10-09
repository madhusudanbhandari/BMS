using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class TeamMemberDto
{
    public int Id{get;set;}
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public UserRoles Role{get;set;}
    public int organizationId{get;set;}
}