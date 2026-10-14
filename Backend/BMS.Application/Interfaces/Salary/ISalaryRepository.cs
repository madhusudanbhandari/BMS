using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Interface;

public interface ISalaryRepository
{
    public Task<Salary?> GetSalaryAsync(int id);

    public Task<(List<Salary>Items, int TotalCount)> GetAllSalariesByOrgId(int orgId,int page,int pageSize,SalaryStatus? salaryStatus);
    public Task<(List<Salary>Items,int totalCount)> GetAllOfMySalaries(int empId,int page,int pageSize,SalaryStatus? salaryStatus);
    public Task AddSalary(Salary salary);
    public Task SaveChangesAsync();


}