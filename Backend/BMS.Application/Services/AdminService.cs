using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Application.Exceptions;
using AutoMapper;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IAuthRepository _authRepository;
    private readonly IEventNotificationService _eventNotificationService;
    private readonly IMapper _mapper;
    public AdminService(IAdminRepository adminRepository,
                            IAuthRepository authRepository,
                            IEventNotificationService eventNotificationService,
                            IMapper mapper)
    {
        _adminRepository=adminRepository;
        _authRepository=authRepository;
        _eventNotificationService=eventNotificationService;
        _mapper=mapper;
    }

    public async Task<List<ViewPendingUser>> ViewAllPendingUsersAsync(int adminId)
    {

        //get the admin from the adminId, then get Its organizationID to allow only admin of the same organization to verify requests to that organization

        var admin=await _authRepository.GetUserByIdAsync(adminId);
        if (admin == null)
        {
            throw new NotFoundException("Cannot find the admin");
        }
        var orgId=admin.OrganizationId;

        var users=await _adminRepository.GetPendingUsersByOrganizationAsync(orgId);

        // return users.Select(user=>new ViewPendingUser
        // {
        //     Id=user.Id,
        //     FirstName=user.FirstName,
        //     LastName=user.LastName,
        //     Email=user.Email,
        //     OrganizationId=user.OrganizationId,
        //     UserStatus=user.Status,
        //     Role=user.Role.ToString()            
        // }).ToList();

        return _mapper.Map<List<ViewPendingUser>>(users);
    }

    public async Task<ViewPendingUser> VerifyUserRequest(int adminId,VerifyUserDto dto)
    {
        var admin=await _authRepository.GetUserByIdAsync(adminId);
        if(admin==null)
            throw new NotFoundException("cannot find exception");

        var orgId=admin.OrganizationId;
        var user=await _adminRepository.GetPendingUserByIdAsync(orgId,dto.UserId);

        if(user==null)
            throw new NotFoundException("User does not exist");

        if (user.OrganizationId != orgId)
        {
            throw new InvalidOperationException("you cannot control users of this organization");
        }
        
        user.Role=dto.Role;
        user.Status=dto.Status;

        _eventNotificationService.Record(
            actorUserId:adminId,
            targetUserId: user.Id,
            organizationId:user.OrganizationId,
            title:"User Verified",
            message:$"User  verified {user.Id}",
            description:$"{user.FirstName} {user.LastName} waiting for verification",
            relatedEntityType:"User",
            relatedEntityId:user.Id
        );

        await _authRepository.SaveChangesAsync();

        return _mapper.Map<ViewPendingUser>(user);
    }


}