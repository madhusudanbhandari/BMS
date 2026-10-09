using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class TeamRepository : ITeamRepository
{
    private readonly BmsDbContext _context;

    public TeamRepository(BmsDbContext context)
    {
        _context=context;
    }
    public async Task<Team?> GetTeamAsync(int teamId)
    {
        return await _context.Teams
                .Include(t=>t.Members)
                .FirstOrDefaultAsync(t=>t.Id==teamId);
        
    }

    public async Task<List<Team>> ViewTeamsAsync()
    {
        return await _context.Teams.ToListAsync();
    }

    public async Task<User?> GetUserAsync(int userId)
    {
        return await _context.Users.FirstOrDefaultAsync(u=>u.Id==userId);
    }
    public async Task AddTeamAsync(Team team)
    {
         await _context.Teams.AddAsync(team);
    }

    public  async Task RemoveTeamAsync(Team team)
    {
        _context.Teams.Remove(team);
    }


    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}