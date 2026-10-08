using System.Linq.Expressions;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly IUserRepository _userRepository;
    public AdminService(IAdminRepository adminRepository,IUserRepository userRepository)
    {
        _adminRepository=adminRepository;
        _userRepository=userRepository;
    }

    public async Task<List<ViewPendingUser>> ViewAllPendingUsersAsync(int adminId)
    {

        //get the admin from the adminId, then get Its organizationID to allow only admin of the same organization to verify requests to that organization

        var admin=await _userRepository.GetUserByIdAsync(adminId);
        if (admin == null)
        {
            throw new Exception("Cannot find the admin");
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
        var admin=await _userRepository.GetUserByIdAsync(adminId);
        if(admin==null)
            throw new Exception("cannot find exception");

        var orgId=admin.OrganizationId;
        var user=await _adminRepository.GetPendingUserByIdAsync(orgId,dto.UserId);

        if(user==null)
            throw new Exception("User does not exist");

        if (user.OrganizationId != orgId)
        {
            throw new Exception("you cannot control users of this organization");
        }
        
        user.Role=dto.Role;
        user.Status=dto.Status;

        await _userRepository.SaveChangesAsync();

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