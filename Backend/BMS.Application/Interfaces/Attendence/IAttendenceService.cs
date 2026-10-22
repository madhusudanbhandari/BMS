using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BMS.Application.Interface;

public interface IAttendenceService
{
    Task<ViewAttendenceDto> AttendAsync(int userId);
    Task<List<ViewAttendenceDto>> ViewMyAttendences(int userId);

}