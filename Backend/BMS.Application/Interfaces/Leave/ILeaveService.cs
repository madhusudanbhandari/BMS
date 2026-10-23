using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface ILeaveService
{
    public Task<ViewLeaveDto> ApplyLeaveAsync(int userId,ApplyLeaveDto dto);
    public Task<List<ViewLeaveDto>> ViewEmployeeLeaves(int reqId,int empId);
    public Task<ViewLeaveDto> UpdateLeaveAsync(int reqId,int leaveId,UpdateLeaveDto dto);
    public Task<ViewLeaveDto> ViewLeaveById(int reqId,int leaveId);
    public Task<List<ViewLeaveDto>> ViewOrganizationsLeaves(int reqId);
}