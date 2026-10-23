using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Data;

public class BmsDbContext : DbContext
{
    public BmsDbContext(DbContextOptions<BmsDbContext> options) : base(options)
    {
        
    }

    public DbSet<Organization> Organizations=>Set<Organization>();
    public DbSet<User> Users=>Set<User>();
    public DbSet<Team> Teams=>Set<Team>();
    public DbSet<Project> Projects=>Set<Project>();
    public DbSet<TaskItem> TaskItems=>Set<TaskItem>();
    public DbSet<PAdmin> PAdmins=>Set<PAdmin>();
    public DbSet<Salary> Salary=>Set<Salary>();
    public DbSet<Notification> Notifications=>Set<Notification>();
    public DbSet<ActivityEvent> ActivityEvents=>Set<ActivityEvent>();

    public DbSet<Attendence> Attendences=>Set<Attendence>();
    public DbSet<Leave> Leaves=>Set<Leave>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PAdmin>()
                    .HasIndex(p=>p.Email)
                    .IsUnique();

        modelBuilder.Entity<Organization>()
                    .HasMany(o=>o.Users)
                    .WithOne(u=>u.Organization)
                    .HasForeignKey(u=>u.OrganizationId)
                    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Organization>()
                    .HasMany(o=>o.Teams)
                    .WithOne(t=>t.Organization)
                    .HasForeignKey(t=>t.OrganizationId)
                    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Organization>()
                    .HasMany(o=>o.Projects)
                    .WithOne(p=>p.Organization)
                    .HasForeignKey(p=>p.OrganizationId)
                    .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Project>()
                    .HasMany(p=>p.TaskItems)
                    .WithOne(t=>t.Project)
                    .HasForeignKey(t=>t.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
        

        modelBuilder.Entity<Team>()
                    .HasMany(t => t.Members)
                    .WithMany(u => u.Teams)
                    .UsingEntity<Dictionary<string, object>>(
                        "TeamUser",
                        j => j.HasOne<User>()
                            .WithMany()
                            .HasForeignKey("MembersId"),
                        j => j.HasOne<Team>()
                            .WithMany()
                            .HasForeignKey("TeamId"),
                        j =>
                        {
                            j.HasKey("TeamId", "MembersId");
                            j.ToTable("TeamUser");
                        });

        modelBuilder.Entity<ActivityEvent>()
                    .HasIndex(e=>new{e.OrganizationId,e.CreatedAt});
        
        modelBuilder.Entity<ActivityEvent>()
                    .HasIndex(e=>new{e.TargetUser,e.CreatedAt});
        
        modelBuilder.Entity<Notification>()
                    .HasIndex(e=>new {e.UserId, e.CreatedAt, e.IsRead});

        
        modelBuilder.Entity<Notification>()
                    .HasOne(n=>n.ActivityEvent)
                    .WithMany(e=>e.Notifications)
                    .HasForeignKey(n=>n.ActivityEventId)
                    .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Salary>()
                    .HasOne(s=>s.User)
                    .WithMany(u=>u.Salaries)
                    .HasForeignKey(s=>s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);


        modelBuilder.Entity<Attendence>()
                    .HasOne(a=>a.User)
                    .WithMany(u=>u.Attendences)
                    .HasForeignKey(a=>a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Leave>()
                    .HasOne(l=>l.User)
                    .WithMany(u=>u.Leaves)
                    .HasForeignKey(l=>l.userId)
                    .OnDelete(DeleteBehavior.Cascade);  

        modelBuilder.Entity<Attendence>()
                    .HasIndex(u => new
                    {
                        u.DateTime,
                        u.UserId
                    }).IsUnique();
    }

}