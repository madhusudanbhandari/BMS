using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface IProjectService
{
    public Task<ViewProjectDto> CreateProjectAsync(int reqId,CreateProjectDto dto);
    public Task<ViewProjectDto?> ViewProjectByIdAsync(int reqId,int projId);
    public Task<List<ViewProjectDto>> ViewAllProjectsAsync(int reqId,int orgId);

    public Task<ViewProjectDto?> UpdateProjectAsync(int reqId,int projId, UpdateProjectDto dto);

    public Task<bool?> DeleteProjectAsync(int reqId,int projId);


    public Task<ViewProjectDto> AssignTeamAsync(int reqId,AssignTeamDto dto);
}