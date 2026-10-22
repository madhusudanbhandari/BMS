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

    public async Task<ViewAttendenceDto> ViewEmployeeAttendence(int reqId,int EmpId)
    {
        var requester=await _authRepository.GetUserByIdAsync(reqId);

        if (requester == null)
        {
            throw new NotFoundException("Cannot find the requester");
        }

        var attendence=await _attendenceRepository.ViewEmpAttendences(EmpId);
        if (attendence == null)
        {
            throw new NotFoundException("Cannot find the attendence for that user");
        }

        if (requester.OrganizationId != attendence.OrganizationId)
        {
            throw new BadRequestException("You cannot see the attendence of this employee");
        }

        return new ViewAttendenceDto
        {
            Id=attendence.Id,
            UserId=attendence.UserId,
            DateTime=attendence.DateTime,
            OrganizationId=attendence.OrganizationId,
            Role=attendence.Role
        };
    }

    public async Task<List<ViewAttendenceDto>> ViewOrganizationAttendence(int reqId,int OrgId)
    {

        var user=await _authRepository.GetUserByIdAsync(reqId);

        if (user == null)
        {
            throw new Exception("Cannot find the user");
        }


        if (user.OrganizationId != OrgId)
        {
            throw new BadRequestException("You cannot see the attendences of this Organization");
        }

        var attendences=await _attendenceRepository.ViewOrgAttendences(OrgId);


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