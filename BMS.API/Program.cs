using BMS.Infrastructure.Data;
using BMS.Infrastructure.DependencyInjection;

var builder=WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Configuration.AddUserSecrets<Program>();

builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app=builder.Build();

using(var scope = app.Services.CreateScope())
{
    var context=scope.ServiceProvider.GetRequiredService<BmsDbContext>();
    var configuration=scope.ServiceProvider.GetRequiredService<IConfiguration>();

    await DbSeeder.SeedAsync(context,configuration);
}

app.MapControllers();

app.Run();