using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface IAuthService
{
    public Task<AuthResponse> RegisterAsync(RegisterRequest request);
    public Task<AuthResponse> LoginAsync(LoginRequest request);

}