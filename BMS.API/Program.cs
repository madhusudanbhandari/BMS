using System.Text;
using BMS.Application.Interface;
using BMS.Infrastructure.Data;
using BMS.Infrastructure.DependencyInjection;
using BMS.Infrastructure.Repository;
using BMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder=WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Configuration.AddUserSecrets<Program>();

builder.Services.AddControllers();

builder.Services.AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
).AddJwtBearer(options =>
{
    options.TokenValidationParameters=new TokenValidationParameters
    {
        ValidateIssuer=true,
        ValidateAudience=true,
        ValidateLifetime=true,
        ValidateIssuerSigningKey=true,

        ValidIssuer=builder.Configuration["Jwt:Issuer"],
        ValidAudience=builder.Configuration["Jwt:Audience"],

        IssuerSigningKey=new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"]!
            )
        )
    };
});
builder.Services.AddAuthorization();

builder.Services.AddOpenApi();


builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();


var app=builder.Build();

using(var scope = app.Services.CreateScope())
{
    var context=scope.ServiceProvider.GetRequiredService<BmsDbContext>();
    var configuration=scope.ServiceProvider.GetRequiredService<IConfiguration>();

    await DbSeeder.SeedAsync(context,configuration);
}

app.MapControllers();

app.Run();