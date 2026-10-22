using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class AttendenceRepository:IAttendenceRepository
{
    private readonly BmsDbContext _context;

    public AttendenceRepository(BmsDbContext context)
    {
        _context=context;
    }
    public async Task AddAttendence(Attendence attendence)
    {
         await _context.Attendences.AddAsync(attendence);
    }

    public async Task<List<Attendence>> ViewMyAttendences(int id)
    {
        return await _context.Attendences.Where(a=>a.UserId==id)
                                         .ToListAsync();
    }

    public async Task<bool> IsMarkedToday(int userId, DateTime today,DateTime tomorrow)
    {
        return await _context.Attendences.AnyAsync(a=>a.UserId==userId &&
                                                a.DateTime>=today &&
                                                a.DateTime<tomorrow);
    }
    
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}