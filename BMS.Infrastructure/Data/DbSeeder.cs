using BMS.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BMS.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(BmsDbContext context, IConfiguration configuration)
    {
        var PlatformAdminExists=await context.PAdmins.AnyAsync();

        if(PlatformAdminExists)
            return;
        
        var email=configuration["PlatformAdmin:Email"];
        var password=configuration["PlatformAdmin:Password"];

        if(string.IsNullOrWhiteSpace(email)|| string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException("Platform admin credentials are not provided");
        }

        var PlatformAdmin=new PAdmin
        {
            Id=1,
            FirstName="Admin",
            LastName="One",
            Email=email,
            Password=BCrypt.Net.BCrypt.HashPassword(password)
        };
        
        context.PAdmins.Add(PlatformAdmin);
         await context.SaveChangesAsync();
    }
}