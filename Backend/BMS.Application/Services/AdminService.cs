using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Application.Exceptions;

namespace BMS.Application.Service;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IAuthRepository _authRepository;
    public AdminService(IAdminRepository adminRepository,IAuthRepository authRepository)
    {
        _adminRepository=adminRepository;
        _authRepository=authRepository;
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

        return users.Select(user=>new ViewPendingUser
        {
            Id=user.Id,
            FirstName=user.FirstName,
            LastName=user.LastName,
            Email=user.Email,
            OrganizationId=user.OrganizationId,
            UserStatus=user.Status,
            Role=user.Role.ToString()            
        }).ToList();
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

        await _authRepository.SaveChangesAsync();

        return new ViewPendingUser
        {
            Id=user.Id,
            FirstName=user.FirstName,
            LastName=user.LastName,
            Email=user.Email,
            OrganizationId=user.OrganizationId,
            UserStatus=user.Status,
            Role=user.Role.ToString()
        };
    }


}