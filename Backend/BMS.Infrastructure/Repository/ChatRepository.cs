using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class ChatRepository : IChatRepository
{
    private readonly BmsDbContext _context;

    public ChatRepository(BmsDbContext context)
    {
        _context=context;
    }

    public async Task<List<Chat>> ViewMyMessageAsync(int receiverId)
    {
        var messages=await _context.Chats
                                    .Where(c=>c.ReceiverId==receiverId)
                                    .AsNoTracking()
                                    .ToListAsync();

        return messages;
    }

    public async Task<List<Chat>> ViewConversationAsync(int userId,int otherUserId)
    {
        
        return await _context.Chats
                            .Where(c=>(c.SenderId==userId && c.ReceiverId==otherUserId) ||
                             (c.SenderId==otherUserId && c.ReceiverId==userId))
                             .OrderBy(c=>c.SentAt)
                             .ToListAsync();

    }

    public async Task<List<Chat>> ViewUnreadMessages(int senderId, int receiverId)
    {
        var messages=await _context.Chats
                                    .Where(c=>c.SenderId==senderId && c.ReceiverId==receiverId && !c.isRead)
                                    .ToListAsync();
        return messages;
    }
    public async Task AddMessageAsync(Chat chat)
    {
        await _context.Chats.AddAsync(chat);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}