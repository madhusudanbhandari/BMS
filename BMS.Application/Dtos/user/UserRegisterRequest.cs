using BMS.Domain.Entities;

namespace BMS.Application.Dtos;

public class UserRegisterRequest
{
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public string Password{get;set;}=string.Empty;
    public int OrganizationId{get;set;}
}