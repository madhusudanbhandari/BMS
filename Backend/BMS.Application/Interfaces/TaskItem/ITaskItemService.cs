using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface ITaskItemService
{
    public Task<ViewTaskItemDto> CreateTaskItemAsync(CreateTaskItemDto dto);
    public Task<ViewTaskItemDto> UpdateTaskItemAsync(int reqid,int id,UpdateTaskItemDto dto);
    public Task<ViewTaskItemDto?> ViewTaskItemAsync(int reqId,int id);
    public Task<List<ViewTaskItemDto>> ViewAllTaskItems(int reqId,int projId);

    public Task<bool?> DeleteTaskItemAsync(int reqId,int id);
}