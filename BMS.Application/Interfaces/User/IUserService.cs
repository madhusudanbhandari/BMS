using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IUserService
{
    Task<UserResponse> RegisterRequestAsync(UserRegisterRequest registerRequest);
    Task<UserResponse>LoginRequestAsync(UserLoginRequest request);
   // Task<User?> ViewUserAsync();
}