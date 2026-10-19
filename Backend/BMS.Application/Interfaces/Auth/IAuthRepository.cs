using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAuthRepository
{
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetOrgAdminAsync(int orgId);
    Task AddUserAsync(User user);

    Task DeleteUserAsync(User user);
    Task SaveChangesAsync();
}