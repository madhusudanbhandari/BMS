using System.ComponentModel.DataAnnotations;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class VerifyUserDto
{
    [Required]
    [Range(1,int.MaxValue)]
    public int UserId{get;set;}

    [EnumDataType(typeof(UserRoles))]
    public UserRoles Role{get;set;}

    [Required]
    [EnumDataType(typeof(UserStatus))]
    public UserStatus Status{get;set;}
}