using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface ITaskItemService
{
    public Task<ViewTaskItemDto> CreateTaskItemAsync(int id,CreateTaskItemDto dto);
    public Task<ViewTaskItemDto> UpdateTaskItemAsync(int reqid,int id,UpdateTaskItemDto dto);
    public Task<ViewTaskItemDto> UpdateTaskItemStatus(int reqId, int taskItem, UpdateStatusDto dto);
    public Task<ViewTaskItemDto?> ViewTaskItemAsync(int reqId,int id);

    public Task<List<ViewTaskItemDto>> ViewEmployeeTaskItems(int reqId);
    public Task<List<ViewTaskItemDto>> ViewAllTaskItems(int reqId,int projId);

    public Task<bool?> DeleteTaskItemAsync(int reqId,int id);
}