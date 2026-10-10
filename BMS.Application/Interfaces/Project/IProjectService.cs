using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface IProjectService
{
    public Task<ViewProjectDto> CreateProjectAsync(CreateProjectDto dto);
    public Task<ViewProjectDto?> ViewProjectByIdAsync(int projId);
    public Task<List<ViewProjectDto>> ViewAllProjectsAsync(int orgId);

    public Task<ViewProjectDto?> UpdateProjectAsync(int projId, UpdateProjectDto dto);

    public Task<bool?> DeleteProjectAsync(int projId);
}