using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IChatRepository
{
    Task AddMessageAsync(Chat chat);
    Task<List<Chat>> ViewMyMessageAsync(int receiverId);

    Task SaveChangesAsync();

}