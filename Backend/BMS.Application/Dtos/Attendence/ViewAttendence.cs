using BMS.Domain.Entities.Enums;

namespace BMS.Application.Interface;

public class ViewAttendenceDto
{
    public int Id{get;set;}
    public int UserId{get;set;}
    public  DateTime DateTime{get;set;}
    public int OrganizationId{get;set;}

    public UserRoles Role{get;set;}
}