using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class LeaveRepository : ILeaveRepository
{
    private readonly BmsDbContext _context;

    public LeaveRepository(BmsDbContext context)
    {
        _context=context;
    }
    public async Task<List<Leave>> GetOrgLeaveRequests(int orgId)
    {
        var orgLeaves=await _context.Leaves.
                                            Where(l=>l.OrganizationId==orgId && 
                                                    l.LeaveStatus==Domain.Entities.Enums.LeaveStatus.Pending)
                                            .ToListAsync();
        return orgLeaves;
    }

    

    public async Task<List<Leave>> ViewEmployeeLeavesAsync(int empId)
    {
        return await _context.Leaves.Where(l=>l.userId==empId).ToListAsync();
    }

    public async Task<Leave?> GetLeaveById(int leaveId)
    {
        return await _context.Leaves.FirstOrDefaultAsync(l=>l.Id==leaveId);
    }

    public async Task AddLeaveAsync(Leave leave)
    {
        await _context.Leaves.AddAsync(leave);

    }

    public async Task SaveChangesAsync()
    {
         await _context.SaveChangesAsync();
    }
}