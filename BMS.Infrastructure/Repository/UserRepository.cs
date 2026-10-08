using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class UserRepository : IUserRepository
{
    private readonly BmsDbContext _context;

    public UserRepository(BmsDbContext context)
    {
        _context=context;
    }
    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u=>u.Email==email);

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