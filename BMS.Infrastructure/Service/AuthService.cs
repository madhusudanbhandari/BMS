using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;

namespace BMS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IAuthRepository authRepository,IConfiguration configuration)
    {
        _authRepository=authRepository;
        _configuration=configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser=await _authRepository.ExistingUserAsync(request.Email);

        if(existingUser!=null)
            throw new Exception("Email already exists");

        var organization=new Organization
        {
            Id=Guid.NewGuid(),
            Name=request.OrganizationName,
            CreatedAt=DateTime.UtcNow,
        };

        var user=new User
        {
            Id=Guid.NewGuid(),
            FirstName=request.FirstName,
            LastName=request.LastName,
            Email=request.Email,
            Password=request.Password,

            Role=Domain.Entities.Enums.UserRoles.OrganizationAdmin,

            OrganizationId=organization.Id
        };

        await _authRepository.AddOrganizationAsync(organization);
        await _authRepository.AddUserAsync(user);
        await _authRepository.SaveChangesAsync();

        return new AuthResponse
        {
            Token=GenerateToken(user),
            OrganizationId=user.OrganizationId,
            UserId=user.Id,
            Role=user.Role.ToString()
        };
    } 


    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user=await _authRepository.GetUserByEmailAsync(request.Email);

        if(user==null)
            throw new UnauthorizedAccessException("User does not exists");
        
        var verifiedPassword=BCrypt.Net.BCrypt.Verify(request.Password,user.Password);

        if(!verifiedPassword)
            throw new UnauthorizedAccessException("Passwords did not match");
        
        return new AuthResponse
        {
            Token=GenerateToken(user),
            UserId=user.Id,
            OrganizationId=user.OrganizationId,
            Role=user.Role.ToString()
        };

        

    }

    private string GenerateToken(User user)
    {
        var claims=new[]
        {
            new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
            new Claim(ClaimTypes.Email,user.Email.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("OrganizationId",user.OrganizationId.ToString())
        };

        var key=new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"]!
            )
        );

        var credentials=new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token=new JwtSecurityToken(
            issuer:_configuration["Jwt:Issuer"],
            audience:_configuration["Jwt:Audience"],
            claims:claims,
            expires:DateTime.UtcNow.AddMinutes(
                int.Parse(
                    _configuration["Jwt:Expiratio"]!
                )
            ),
            signingCredentials:credentials           

        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


}