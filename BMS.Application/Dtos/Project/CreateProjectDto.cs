namespace BMS.Application.Dtos;


public class CreateProjectDto
{
    public string Name{get;set;}=string.Empty;
    public string Description{get;set;}=string.Empty;

    public int OrganizationId{get;set;}
    
}