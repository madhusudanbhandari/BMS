using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class AuthRepository : IAuthRepository
{
    private readonly BmsDbContext _context;
    
    public AuthRepository(BmsDbContext context)
    {
        _context=context;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u=>u.Email==email);
    }

    public async Task<bool?> ExistingUserAsync(string email)
    {
        return await _context.Users.AnyAsync(u=>u.Email==email);
    }

    public async Task AddOrganizationAsync(Organization organization)
    {
        await _context.Organizations.AddAsync(organization);
    }

    public async Task AddUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

}