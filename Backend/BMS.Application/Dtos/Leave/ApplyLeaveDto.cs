using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;
public class ApplyLeaveDto
{
    public string Reason{get;set;}=string.Empty;
    public DateTime From{get;set;}
    public DateTime To{get;set;}


}