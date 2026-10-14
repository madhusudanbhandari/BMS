using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class UpdateSalaryDto
{
    public SalaryStatus SalaryStatus{get;set;}
    public string? RejectionReason{get;set;}


}