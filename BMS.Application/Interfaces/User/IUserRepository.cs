using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IUserRepository
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdAsync(int id);
    Task AddUserAsync(User user);
    Task SaveChangesAsync();
}