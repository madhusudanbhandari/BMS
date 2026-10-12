using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAdminService
{
    public Task<ViewPendingUser> VerifyUserRequest(int adminId ,VerifyUserDto verify);

    public Task<List<ViewPendingUser>> ViewAllPendingUsersAsync(int adminId );

    


}