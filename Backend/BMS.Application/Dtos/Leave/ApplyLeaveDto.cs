using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;
public class ApplyLeaveDto
{
    public string Reason{get;set;}=string.Empty;
    public DateOnly From{get;set;}
    public DateOnly To{get;set;}


}