using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IChatRepository
{
    Task AddMessageAsync(Chat chat);
    Task<List<Chat>> ViewMyMessageAsync(int receiverId);
    Task<List<Chat>> ViewConversationAsync(int senderId,int receiverId);
    Task<List<Chat>> ViewUnreadMessages(int senderId, int receiverId);
    Task SaveChangesAsync();

}