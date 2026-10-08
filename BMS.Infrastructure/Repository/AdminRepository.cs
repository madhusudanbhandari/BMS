using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class AdminRepository : IAdminRepository
{
    private readonly BmsDbContext _context;

    public AdminRepository(BmsDbContext context)
    {
        _context=context;
    }
    public async Task<List<User>> GetPendingUsersByOrganizationAsync(int orgId)
    {
        return await _context.Users
                                .Where(u=>u.Status==Domain.Entities.Enums.UserStatus.Pending && u.OrganizationId==orgId)
                                .ToListAsync();
    }

    public async Task<User?> GetPendingUserByIdAsync(int orgId,int id)
    {
        return await _context.Users
                                .Where(u=>u.Id==id && u.Status==Domain.Entities.Enums.UserStatus.Pending)
                                .Where(u=>u.OrganizationId==orgId)
                                .FirstOrDefaultAsync();
    }
}