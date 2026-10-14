using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class ViewSalaryDto
{
    public int UserId{get;set;}
    public decimal Amount{get;set;}
    public int Duration{get;set;}
    public string AccountName{get;set;}=string.Empty;
    public string AccountNumber{get;set;}=string.Empty;
    public SalaryStatus SalaryStatus{get;set;}
    public DateTime RequestedAt{get;set;}
    public DateTime? ReleasedAt{get;set;}
}