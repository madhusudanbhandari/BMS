using BMS.Application.Exceptions;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class AttendenceService:IAttendenceService
{
    private readonly IAttendenceRepository _attendenceRepository;
    private readonly IAuthRepository _authRepository;

    public AttendenceService(IAttendenceRepository attendenceRepository,IAuthRepository authRepository)
    {
        _attendenceRepository=attendenceRepository;
        _authRepository=authRepository;
    }


    public async Task<ViewAttendenceDto>AttendAsync(int id)
    {
        var user=await _authRepository.GetUserByIdAsync(id);

        if (user == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var today=DateTime.UtcNow.Date;
        var tomorrow=today.AddDays(1);

        var alreadyMarked=await _attendenceRepository.IsMarkedToday(user.Id, today,tomorrow);

        if (alreadyMarked)
        {
            throw new BadRequestException("You have already marked today");
        }

        
        var attendence=new Attendence
        {
            UserId=id,
            DateTime=DateTime.UtcNow,
            OrganizationId=user.OrganizationId,
            Role=user.Role

        };

        await _attendenceRepository.AddAttendence(attendence);
        await _attendenceRepository.SaveChangesAsync();

        return new ViewAttendenceDto
        {
            Id=attendence.Id,
            UserId=attendence.UserId,
            DateTime=attendence.DateTime,
            OrganizationId=attendence.OrganizationId,
            Role=attendence.Role
        };

        
    }

    public async Task<List<ViewAttendenceDto>> ViewMyAttendences(int id)
    {
        var attendences=await _attendenceRepository.ViewMyAttendences(id);

        return attendences.Select(attendence=>new ViewAttendenceDto
        {
            Id=attendence.Id,
            UserId=attendence.UserId,
            DateTime=attendence.DateTime,
            OrganizationId=attendence.OrganizationId,
            Role=attendence.Role
        }).ToList();
    }
}