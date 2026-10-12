using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAdminRepository
{
    Task<List<User>> GetPendingUsersByOrganizationAsync(int orgId);
    Task<User?> GetPendingUserByIdAsync(int orgId,int id);
}