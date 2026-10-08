using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BMS.Application.Service;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration=configuration;
    }

    public string GenerateTokenAsync(User user)
    {
        var claims=new []
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("Organization", user.OrganizationId.ToString())
        };

        var key=new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
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
                int.Parse(_configuration["Jwt:Expiration"]!)
            ),
            signingCredentials:credentials
            
            
        );

        return new JwtSecurityTokenHandler().WriteToken(token);

    }
}