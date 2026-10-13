using BMS.Domain.Entities.enums;

namespace BMS.Application.Dtos;


public class UpdateProjectDto
{
    public string Name{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;
    public ProjectStatus projectStatus{get;set;}
    
}