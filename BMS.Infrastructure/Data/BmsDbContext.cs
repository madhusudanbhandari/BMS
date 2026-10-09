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
                    .HasMany(t=>t.Members)
                    .WithMany(u=>u.Teams);

                    

    }

}