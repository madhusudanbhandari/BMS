using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAuthRepository
{
    Task<User?> GetUserByEmailAsync(string emial);
    Task<bool> ExistingUserAsync(string email);
    Task AddOrganizationAsync(Organization organization);
    Task AddUserAsync(User user); 
    Task SaveChangesAsync();
}