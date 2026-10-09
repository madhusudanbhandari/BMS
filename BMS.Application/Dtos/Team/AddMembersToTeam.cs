using BMS.Domain.Entities.Enums;

namespace BMS.Application.Dtos;

public class AddMembersToTeamDto
{
    public int TeamId{get;set;}
    public int UserId{get;set;}

}