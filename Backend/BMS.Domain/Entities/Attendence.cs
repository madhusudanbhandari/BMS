using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class Attendence
{
    public int Id{get;set;}
    public int UserId{get;set;}
    public User? User{get;set;}
    public  DateTime DateTime{get;set;}
    public int OrganizationId{get;set;}
    public Organization? Organization{get;set;}

    public UserRoles Role{get;set;}


}