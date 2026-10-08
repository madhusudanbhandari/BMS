using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IUserRepository
{
    Task<User?> GetUserByEmailAsync(string email);
    Task AddUserAsync(User user);
    Task SaveChangesAsync();
}