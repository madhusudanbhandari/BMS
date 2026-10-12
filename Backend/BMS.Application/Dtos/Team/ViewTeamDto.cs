namespace BMS.Application.Dtos;

public class ViewTeamDto
{
    public int Id{get;set;}
    public string Name{get;set;}=string.Empty;
    public int OrganizationId{get;set;}

    public List<TeamMemberDto> Members{get;set;}=new();
}