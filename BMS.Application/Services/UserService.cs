using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Service;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public UserService(IUserRepository userRepository,ITokenService tokenService)
    {
        _userRepository=userRepository;
        _tokenService=tokenService;

    }

    public async Task<UserResponse> RegisterRequestAsync(UserRegisterRequest request)
    {
        var user=await _userRepository.GetUserByEmailAsync(request.Email);

        if(user!=null)
            throw new Exception("User with that email already exists");

        var newUser=new User
        {
            FirstName=request.FirstName,
            LastName=request.LastName,
            Email=request.Email,
            Password=BCrypt.Net.BCrypt.HashPassword(request.Password),
            OrganizationId=request.OrganizationId,
            Status=UserStatus.Pending
        };

        await _userRepository.AddUserAsync(newUser);
        await _userRepository.SaveChangesAsync();

        return new UserResponse
        {
            Id=newUser.Id,
            FirstName=newUser.FirstName,
            LastName=newUser.LastName,
            Email=newUser.Email,
            OrganizationId=newUser.OrganizationId
        };        
    }

    public async Task<UserResponse> LoginRequestAsync(UserLoginRequest login)
    {
        var existingUser=await _userRepository.GetUserByEmailAsync(login.Email);

        if (existingUser == null)
        {
            throw new Exception("Cannot find the user with this email");
        }

        var verified=BCrypt.Net.BCrypt.Verify(login.Password,existingUser.Password);

        if(!verified)
            throw new UnauthorizedAccessException("Passwords did not match");

        return new UserResponse
        {
            Id=existingUser.Id,
            FirstName=existingUser.FirstName,
            LastName=existingUser.LastName,
            Email=existingUser.Email,
            OrganizationId=existingUser.OrganizationId,

            Token=_tokenService.GenerateTokenAsync(existingUser)
        };


    }
}