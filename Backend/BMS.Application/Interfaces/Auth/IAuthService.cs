using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAuthService
{
    Task<UserResponse> RegisterRequestAsync(UserRegisterRequest registerRequest);
    Task<UserResponse>LoginRequestAsync(UserLoginRequest request);
    Task<List<UserResponse>> ViewOrganizationEmployees(int orgId);
    Task<UserResponse> UpdateUserAsync(string requestEmail,string targetEmail,UpdateUserDto dto);
    Task<bool?> DeleteUserAsync(string requestEmail,string targetEmail);
   // Task<User?> ViewUserAsync();
}