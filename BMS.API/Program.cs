
using BMS.Infrastructure.DependencyInjection;

var builder=WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app=builder.Build();

app.MapControllers();

app.Run();