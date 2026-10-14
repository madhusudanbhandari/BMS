using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ISalaryRepository
{
    public Task<Salary?> GetSalaryAsync(int id);
    public Task AddSalary(Salary salary);
    public Task SaveChangesAsync();
}