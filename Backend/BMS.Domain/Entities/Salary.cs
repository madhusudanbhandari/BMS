using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class Salary
{
    public int Id{get;set;}
    public decimal Amount{get;set;}
    public int UserId{get;set;}
    public User User{get;set;}=null!;
    public int Duration{get;set;}
    public string AccountName{get;set;}=string.Empty;
    public string AccountNumber{get;set;}=string.Empty;
    public DateTime RequestedAt{get;set;}
    public DateTime? ReleasedAt{get;set;}
    public string? RejectionReason{get;set;}=string.Empty;
    public SalaryStatus SalaryStatus{get;set;}

}