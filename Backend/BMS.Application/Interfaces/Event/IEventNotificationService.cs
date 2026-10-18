using BMS.Domain.Entities;

namespace BMS.Application.Interface;

public interface IEventNotificationService
{
    void Record(
        int actorUserId,
        int? targetUserId,
        int organizationId,
        string description,
        string title,
        string message,
        string? relatedEntityType=null,
        int? relatedEntityId=null

    );
    Task<List<Notification>> GetAllNotificationsOfUser(int userId);

    Task<bool> MarkAsReadAsync(int userId, int notificationId);

}