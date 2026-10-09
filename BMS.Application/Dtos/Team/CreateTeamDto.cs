namespace BMS.Domain.Entities;

public class CreateTeamDto
{
    public string Name{get;set;}=string.Empty;
    public int OrganizationId{get;set;}
}