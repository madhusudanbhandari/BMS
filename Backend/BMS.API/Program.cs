using System.Text;
using BMS.Application.Interface;
using BMS.Infrastructure.Data;
using BMS.Infrastructure.Repository;
using BMS.Application.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using BMS.Api.Hubs;

var builder=WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<BmsDbContext>(options=>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddScoped<IOrgRepository, OrgRepository>();
builder.Services.AddScoped<IOrgService, OrgService>();
builder.Services.AddScoped<ITokenService,TokenService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminRepository,AdminRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectService,ProjectService>();
builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>();
builder.Services.AddScoped<ITaskItemService, TaskItemService>();
builder.Services.AddScoped<ISalaryRepository, SalaryRepository>();
builder.Services.AddScoped<ISalaryService, SalaryService>();
builder.Services.AddScoped<IEventNotificationService, EventNotificationService>();
builder.Services.AddScoped<IAttendenceRepository,AttendenceRepository>();
builder.Services.AddScoped<IAttendenceService, AttendenceService>();
builder.Services.AddScoped<ILeaveRepository, LeaveRepository>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<IChatRepository,ChatRepository>();
builder.Services.AddScoped<IChatService,ChatService>();



builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
).AddJwtBearer(Options =>
{
    Options.TokenValidationParameters=new TokenValidationParameters
    {
        ValidateIssuer=true,
        ValidateAudience=true,
        ValidateLifetime=true,
        ValidateIssuerSigningKey=true,

        ValidIssuer=builder.Configuration["Jwt:Issuer"],
        ValidAudience=builder.Configuration["Jwt:Audience"],

        IssuerSigningKey=new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
        )


    };

    Options.Events=new JwtBearerEvents
    {
        OnMessageReceived =  context =>
        {
            var accessToken= context.Request.Query["access_token"];

            var path=context.HttpContext.Request.Path;

            if(!string.IsNullOrWhiteSpace(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token=accessToken;
            }

            return Task.CompletedTask;
        }
    };
});



builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] =
                new List<string>()
        });
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://bms-sand-seven.vercel.app"
            )
            .AllowAnyHeader()
            .AllowCredentials()
            .AllowAnyMethod();
    }); 
});

var app=builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider
        .GetRequiredService<BmsDbContext>();

    var configuration = scope.ServiceProvider
        .GetRequiredService<IConfiguration>();

    await DbSeeder.SeedAsync(context, configuration);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

}
app.UseExceptionHandler("/error");

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<ChatHub>("/chatHub");

app.MapControllers();

app.Run();

