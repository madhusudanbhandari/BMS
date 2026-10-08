using BMS.Application.Dtos;
using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAdminService
{
    public Task<User> VerifyUserRequest(VerifyUserDto verify);
}