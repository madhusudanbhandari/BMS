using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class VerifyUserDto
{
    public int UserId{get;set;}
    public UserRoles Role{get;set;}

    public UserStatus Status{get;set;}
}