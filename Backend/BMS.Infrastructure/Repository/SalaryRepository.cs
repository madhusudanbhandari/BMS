using BMS.Application.Interface;
using BMS.Domain.Entities;
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

    public async Task AddSalary(Salary salary)
    {
        await _context.Salary.AddAsync(salary);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}