using BMS.Application.Dtos;
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

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FirstOrDefaultAsync(u=>u.Id==id);
    }
    public async Task AddUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }
    public async Task DeleteUserAsync(User user)
    {
         _context.Users.Remove(user);
    }
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}