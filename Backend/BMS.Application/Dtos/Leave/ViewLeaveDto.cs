using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;
public class ViewLeaveDto
{
    public int Id{get;set;}
    public int userId{get;set;}
    public string Reason{get;set;}=string.Empty;
    public DateOnly From{get;set;}
    public DateOnly To{get;set;}
    public int? ReviewedById{get;set;}
    public int OrganizationId{get;set;}
    public LeaveStatus LeaveStatus{get;set;}

}