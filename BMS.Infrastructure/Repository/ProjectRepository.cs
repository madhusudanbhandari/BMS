using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class ProjectRepository : IProjectRepository
{
    private readonly BmsDbContext _context;

    public ProjectRepository(BmsDbContext context)
    {
        _context=context;
    }

    public async  Task<Project?>GetProjectByIdAsync(int projId)
    {
        return await _context.Projects.FirstOrDefaultAsync(p=>p.Id==projId);
    }

    public async Task<List<Project>> GetAllProjectsAsync(int orgId)
    {
        return await _context.Projects
                                .Where(p => p.OrganizationId == orgId)
                                .ToListAsync();
    }

    public async Task AddProjectAsync(Project project)
    {
        await _context.Projects.AddAsync(project);
    }

    public async Task RemoveProjectAsync(Project project)
    {
         _context.Projects.Remove(project);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}