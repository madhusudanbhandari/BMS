using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Service;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IAuthRepository authRepository,ITokenService tokenService)
    {
        _authRepository=authRepository;
        _tokenService=tokenService;

    }

    public async Task<UserResponse> RegisterRequestAsync(UserRegisterRequest request)
    {
        var user=await _authRepository.GetUserByEmailAsync(request.Email);

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

        await _authRepository.AddUserAsync(newUser);
        await _authRepository.SaveChangesAsync();

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
        var existingUser=await _authRepository.GetUserByEmailAsync(login.Email);

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

    public async Task<UserResponse> UpdateUserAsync(string requestedUserEmail,string targetUserEmail, UpdateUserDto dto)
    {
        var requested=await _authRepository.GetUserByEmailAsync(requestedUserEmail);
        var target=await _authRepository.GetUserByEmailAsync(targetUserEmail);

        if(requested==null || target == null)
        {
            throw new Exception("User cannot be null");
        }
        if (requested.OrganizationId != target.OrganizationId)
        {
            throw new Exception("users dont belong to the same organization");
        }

        bool isSelf=requested.Id==target.Id;

        bool isManager=requested.Role==UserRoles.Manager;
        bool isAdmin=requested.Role==UserRoles.OrganizationAdmin;

        if(!isSelf && !isManager && !isAdmin)
        {
            throw new Exception("You cannot change this user");
        }



        var user=await _authRepository.GetUserByEmailAsync(targetUserEmail);

        if (user == null)
        {
            throw new Exception("User not found");
        }

        user.FirstName=dto.FirstName;
        user.LastName=dto.LastName;
        user.Email=dto.Email;
        user.Password=dto.Password;
        user.Role=dto.UserRoles;
        user.OrganizationId=dto.OrganizationId;

        await _authRepository.SaveChangesAsync();

        return new UserResponse
        {
            Id=user.Id,
            FirstName=user.FirstName,
            LastName=user.LastName,
            Email=user.Email,
            Role=user.Role.ToString(),
            OrganizationId=user.OrganizationId,

        };
    }
    public async Task<bool?> DeleteUserAsync(string requestedUserEmail,string targetUserEmail)
    {
        var requested=await _authRepository.GetUserByEmailAsync(requestedUserEmail);
        var target=await _authRepository.GetUserByEmailAsync(targetUserEmail);

        if(requested==null || target == null)
        {
            throw new Exception("User cannot be null");
        }
        if (requested.OrganizationId != target.OrganizationId)
        {
            throw new Exception("users dont belong to the same organization");
        }

        bool isSelf=requested.Id==target.Id;

        bool isManager=requested.Role==UserRoles.Manager;
        bool isAdmin=requested.Role==UserRoles.OrganizationAdmin;

        if(!isSelf && !isManager && !isAdmin)
        {
            throw new Exception("You cannot change this user");
        }



        var user=await _authRepository.GetUserByEmailAsync(targetUserEmail);

        if (user == null)
        {
            throw new Exception("Cannot find the user");
        }

        await _authRepository.DeleteUserAsync(user);
        return true;
    }
}