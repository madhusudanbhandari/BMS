using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class SalaryRepository : ISalaryRepository
{
    private readonly BmsDbContext _context;
    public SalaryRepository(BmsDbContext context)
    {
        _context=context;
    }


    public async Task<Salary?> GetSalaryAsync(int id)
    {
        return await _context.Salary
                                .Include(s=>s.User)
                                .FirstOrDefaultAsync(s=>s.Id==id);
    }

    public async Task<(List<Salary>Items, int TotalCount)> GetAllSalariesByOrgId(int orgId, int page,int pageSize,SalaryStatus? salaryStatus)
    {
        var query=_context.Salary.Where(s=>s.User!=null && s.User.OrganizationId==orgId);

        if (salaryStatus.HasValue)
        {
            query.Where(s=>s.SalaryStatus==salaryStatus.Value);
        }

        var totalCount=await query.CountAsync();

        var items=await query
                    .OrderByDescending(s=>s.RequestedAt)
                    .Skip((page-1)*pageSize)
                    .Take(pageSize)
                    .ToListAsync();
        
        return (items,totalCount);
    }
    
    public async Task<(List<Salary>Items,int totalCount)> GetAllOfMySalaries(int empId,int page,int pageSize,SalaryStatus? salaryStatus)
    {
        var query= _context.Salary.Where(e=>e.UserId==empId);

        if (salaryStatus.HasValue)
        {
            query=query.Where(s=>salaryStatus==salaryStatus.Value);
        }

        var totalCount=await query.CountAsync();
        var items=await query
                            .OrderByDescending(s=>s.RequestedAt)
                            .Skip((page-1)*pageSize)
                            .Take(pageSize)
                            .ToListAsync();

        return (items,totalCount);
    }


    public async Task AddSalary(Salary salary)
    {
        await _context.Salary.AddAsync(salary);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}