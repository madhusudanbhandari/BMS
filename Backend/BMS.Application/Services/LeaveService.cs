using BMS.Application.Dtos;
using BMS.Application.Exceptions;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Service;

public class LeaveService : ILeaveService
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IAuthRepository _authRepository;

    public LeaveService(ILeaveRepository leaveRepository,IAuthRepository authRepository)
    {
        _leaveRepository=leaveRepository;
        _authRepository=authRepository;
    }

    public async Task<ViewLeaveDto> ApplyLeaveAsync(int userId,ApplyLeaveDto dto)
    {

        var user=await _authRepository.GetUserByIdAsync(userId);

        if (user == null)
        {
            throw new NotFoundException("Cannot find the user");
        }
        var leave=new Leave
        {
            userId=user.Id,
            Reason=dto.Reason,
            From=dto.From,
            To=dto.To,
            OrganizationId=user.OrganizationId,
            LeaveStatus=Domain.Entities.Enums.LeaveStatus.Pending
        };

        await _leaveRepository.AddLeaveAsync(leave);
        await _leaveRepository.SaveChangesAsync();

        return new ViewLeaveDto
        {
            Id=leave.Id,
            userId=leave.userId,
            Reason=leave.Reason,
            From=leave.From,
            To=leave.To,
            LeaveStatus=leave.LeaveStatus,
            OrganizationId=leave.OrganizationId,
            ReviewedById=leave.ReviewedById,
        };

    }

    public async Task<List<ViewLeaveDto>> ViewEmployeeLeaves(int reqId,int userId)
    {
        var user=await _authRepository.GetUserByIdAsync(reqId);

        if (user == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var leaves=await _leaveRepository.ViewEmployeeLeavesAsync(userId);

        if(user.Role==UserRoles.Employee && user.Id != userId)
        {
            throw new BadRequestException("You cannot view others leaves");
        }

        return leaves.Select(leave=>new ViewLeaveDto
        {
            Id=leave.Id,
            userId=leave.userId,
            Reason=leave.Reason,
            From=leave.From,
            To=leave.To,
            LeaveStatus=leave.LeaveStatus,
            OrganizationId=leave.OrganizationId,
            ReviewedById=leave.ReviewedById
        }).ToList();
    }

    public async Task<ViewLeaveDto> UpdateLeaveAsync(int reqId,int leaveId, UpdateLeaveDto dto)
    {
        var requester=await _authRepository.GetUserByIdAsync(reqId);

        if (requester == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var leave=await _leaveRepository.GetLeaveById(leaveId);

        if (leave == null)
        {
            throw new NotFoundException("Cannot find the leave");
        }

        if (requester.OrganizationId != leave.OrganizationId)
        {
            throw new BadRequestException("Cannot update other organization's leaves");
        }

        leave.LeaveStatus=dto.LeaveStatus;
        leave.ReviewedById=requester.Id;

        await _leaveRepository.SaveChangesAsync();

        return new ViewLeaveDto
        {
            Id=leave.Id,
            userId=leave.userId,
            Reason=leave.Reason,
            From=leave.From,
            To=leave.To,
            ReviewedById=requester.Id,
            LeaveStatus=leave.LeaveStatus,
            OrganizationId=leave.OrganizationId
        };
        
    }

    public async Task<ViewLeaveDto> ViewLeaveById(int reqId,int leaveId)
    {

        var requester=await _authRepository.GetUserByIdAsync(reqId);

        if (requester == null)
        {
            throw new NotFoundException("Cannot find the user with this id");    
        }

        var leave=await _leaveRepository.GetLeaveById(leaveId);

        if (leave == null)
        {
            throw new Exception("Cannot find the leave");
        }

        if(requester.Role==UserRoles.Employee && leave.userId != requester.Id)
        {
            throw new BadRequestException("You cannot see this leave");
        }

        if((requester.Role==UserRoles.HR || requester.Role==UserRoles.Manager) && requester.OrganizationId != leave.OrganizationId) //&& has higher precedence then || 
        {
            throw new BadRequestException("You cannot see the leaves of other organization");
        }

        return new ViewLeaveDto
        {
            Id=leave.Id,
            userId=leave.userId,
            Reason=leave.Reason,
            From=leave.From,
            To=leave.To,
            LeaveStatus=leave.LeaveStatus,
            OrganizationId=leave.OrganizationId,
            ReviewedById=leave.ReviewedById
        };


    }
}