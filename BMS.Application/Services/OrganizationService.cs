using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class OrgService : IOrgService
{
    private readonly IOrgRepository _orgRepository;
    private readonly ITokenService _tokenService;

    public OrgService(IOrgRepository orgRepository,ITokenService tokenService)
    {
        _orgRepository=orgRepository;
        _tokenService=tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser=await _orgRepository.ExistingUserAsync(request.Email);

        if(existingUser)
            throw new Exception("Email already exists");

        var organization=new Organization
        {
            
            Name=request.OrganizationName,
            CreatedAt=DateTime.UtcNow,
        };

        var user=new User
        {
            FirstName=request.FirstName,
            LastName=request.LastName,
            Email=request.Email,
            Password=BCrypt.Net.BCrypt.HashPassword(request.Password),

            Role=Domain.Entities.Enums.UserRoles.OrganizationAdmin,

            Organization=organization
        };

        await _orgRepository.AddOrganizationAsync(organization);
        await _orgRepository.AddUserAsync(user);
        await _orgRepository.SaveChangesAsync();

        return new AuthResponse
        {
            OrganizationId=user.OrganizationId,
            UserId=user.Id,
            Role=user.Role.ToString()
        };
    } 


    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user=await _orgRepository.GetUserByEmailAsync(request.Email);

        if(user==null)
            throw new UnauthorizedAccessException("User does not exists");
        
        var verifiedPassword=BCrypt.Net.BCrypt.Verify(request.Password,user.Password);

        if(!verifiedPassword)
            throw new UnauthorizedAccessException("Passwords did not match");
        
        return new AuthResponse
        {
            Token=_tokenService.GenerateTokenAsync(user),
            UserId=user.Id,
            OrganizationId=user.OrganizationId,
            Role=user.Role.ToString()
        };

        

    }

    // private string GenerateToken(User user)
    // {
    //     var claims=new[]
    //     {
    //         new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
    //         new Claim(ClaimTypes.Email,user.Email.ToString()),
    //         new Claim(ClaimTypes.Role, user.Role.ToString()),
    //         new Claim("OrganizationId",user.OrganizationId.ToString())
    //     };

    //     var key=new SymmetricSecurityKey(
    //         Encoding.UTF8.GetBytes(
    //             _configuration["Jwt:Key"]!
    //         )
    //     );

    //     var credentials=new SigningCredentials(
    //         key,
    //         SecurityAlgorithms.HmacSha256
    //     );

    //     var token=new JwtSecurityToken(
    //         issuer:_configuration["Jwt:Issuer"],
    //         audience:_configuration["Jwt:Audience"],
    //         claims:claims,
    //         expires:DateTime.UtcNow.AddMinutes(
    //             int.Parse(
    //                 _configuration["Jwt:Expiration"]!
    //             )
    //         ),
    //         signingCredentials:credentials           

    //     );

    //     return new JwtSecurityTokenHandler().WriteToken(token);
    // }


}