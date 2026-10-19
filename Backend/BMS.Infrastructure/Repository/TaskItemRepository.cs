using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class TaskItemRepository : ITaskItemRepository
{
    private readonly BmsDbContext _context;
    public TaskItemRepository(BmsDbContext context)
    {
        _context=context;
    }

    public async Task<TaskItem?> GetTaskItemByIdAsync(int id)
    {
        return await _context.TaskItems
                                .Include(ti=>ti.Project)
                                .FirstOrDefaultAsync(t=>t.Id==id);
    }

    public async Task<List<TaskItem>> GetTaskItemsAsync(int ProjId)
    {
        return await _context.TaskItems
                                    .Where(t=>t.ProjectId==ProjId)
                                    .Include(t=>t.Project)
                                    .ToListAsync();
    }

    public async Task<List<TaskItem>> GetEmployeeTaskItemsAsync(int empId)
    {
        return await _context.TaskItems.Where(t=>t.AssignedToUserId==empId).ToListAsync();
    }

    public async Task AddTaskItem(TaskItem taskItem)
    {
        await _context.TaskItems.AddAsync(taskItem);
    }

    public async Task RemoveTaskItem(TaskItem taskItem)
    {
         _context.Remove(taskItem);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }


}