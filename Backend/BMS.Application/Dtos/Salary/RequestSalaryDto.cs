using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class RequestSalaryDto
{
    public decimal Amount{get;set;}
    public int Duration{get;set;}
    public string AccountName{get;set;}=string.Empty;
    public string AccountNumber{get;set;}=string.Empty;
    public DateTime RequestedAt{get;set;}
    public DateTime? ReleasedAt{get;set;}
}