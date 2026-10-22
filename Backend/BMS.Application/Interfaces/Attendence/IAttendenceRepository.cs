using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IAttendenceRepository
{
    public Task AddAttendence(Attendence attendence);
    public Task<List<Attendence>> ViewMyAttendences(int userId);

    public Task<bool> IsMarkedToday(int userId, DateTime today, DateTime tomorrow);
    public Task SaveChangesAsync();
}