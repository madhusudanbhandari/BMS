using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ITaskItemRepository
{
    public Task<TaskItem?> GetTaskItemByIdAsync(int id);

    public Task<List<TaskItem>> GetTaskItemsAsync(int projId);

    public Task AddTaskItem(TaskItem taskItem);
    public Task RemoveTaskItem(TaskItem taskItem);
    public Task SaveChangesAsync();
}