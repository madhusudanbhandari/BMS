using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ILeaveRepository
{
    public Task<List<Leave>> GetOrgLeaveRequests(int orgId);
    public Task<List<Leave>> ViewEmployeeLeavesAsync(int empId);
    public Task<Leave?> GetLeaveById(int leaveId);
    public Task AddLeaveAsync(Leave leave);
    public Task<List<Leave>> GetOrganizationsLeaves(int orgId);

    public Task SaveChangesAsync();
}