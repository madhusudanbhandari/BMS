using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly IEventNotificationService _eventNotificationService;
    public NotificationController(IEventNotificationService eventNotificationService)
    {
        _eventNotificationService=eventNotificationService;
    }

    [HttpGet("view-notification")]
    public async Task<ActionResult<List<ViewNotificationDto>>> ViewMyNotifications()
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var notifications=await _eventNotificationService.GetAllNotificationsOfUser(userId);

        var result= notifications.Select(notification=>new ViewNotificationDto
        {
            Id=notification.Id,
            Title=notification.Title,
            Message=notification.Message,
            CreatedAt=notification.CreatedAt,
            isRead=notification.IsRead
        }).ToList();

        return Ok(result);

    }

    [HttpPatch("mark-as-read")]
    public async Task<IActionResult> MarkAsReadAsync(int notId)
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var updated=await _eventNotificationService.MarkAsReadAsync(userId,notId);

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

}