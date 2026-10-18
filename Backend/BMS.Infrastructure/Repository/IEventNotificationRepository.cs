using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BMS.Infrastructure.Repository;

public class EventNotificationService : IEventNotificationService
{
    private readonly BmsDbContext _context;

    public EventNotificationService(BmsDbContext context)
    {
        _context=context;
    }

    public void  Record(
        int actorUserId,
        int? targetUserId,
        int organizationId,
        string description,
        string title,
        string message,
        string? relatedEntityType = null,
        int? relatedEntityId = null
    )
    {
        var activityEvent=new ActivityEvent
        {
            ActorUser=actorUserId,
            TargetUser=targetUserId,
            OrganizationId=organizationId,
            Description=description,
            RelatedEntity=relatedEntityType,
            RelatedEntityId=relatedEntityId,
            CreatedAt=DateTime.UtcNow
            
        };

        if (targetUserId.HasValue)
        {
            activityEvent.Notifications.Add(new Notification
            {
              Title=title,
              Message=message,
              UserId=targetUserId.Value,
              IsRead=false,
              CreatedAt=DateTime.UtcNow
            });
        }
         _context.ActivityEvents.AddAsync(activityEvent);

    }

    public async Task<List<Notification>> GetAllNotificationsOfUser(int userId)
    {
        return await _context.Notifications
                            .AsNoTracking()
                            .Where(e=>e.UserId==userId)
                            .OrderByDescending(e=>e.CreatedAt)
                            .ToListAsync();

        
    }

    public async Task<bool> MarkAsReadAsync(int userId,int notificationId)
    {
        var notification=await _context.Notifications
                                        .FirstOrDefaultAsync(n=>n.UserId==userId && n.Id==notificationId);
        if (notification == null)
        {
            return false;
        }

        notification.IsRead=true;

        await _context.SaveChangesAsync();
        return true;
    }
}