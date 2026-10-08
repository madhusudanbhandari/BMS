using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface ITokenService
{
    string GenerateTokenAsync(User user);
}