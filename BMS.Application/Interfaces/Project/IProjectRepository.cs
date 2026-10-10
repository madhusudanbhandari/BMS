using BMS.Domain.Entities;

namespace BMS.Application.Interface;


public interface IProjectRepository
{
    public Task<Project?> GetProjectByIdAsync(int projId);
    public Task<List<Project>> GetAllProjectsAsync(int orgId);

    public Task AddProjectAsync(Project project);
    public Task RemoveProjectAsync(Project project);
    public Task SaveChangesAsync();
}