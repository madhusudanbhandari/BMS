using System.Security.Claims;
using BMS.Api.Hubs;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace BMS.Api.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly IHubContext<ChatHub> _hubContext;
    public ChatController(IChatService chatService,IHubContext<ChatHub> hubContext)
    {
        _chatService=chatService;
        _hubContext=hubContext;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessageAsync([FromBody]SendMessageDto dto)
    {
        var userClaim=User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(!int.TryParse(userClaim,out int senderId))
        {
            return Unauthorized();
        }

        var sentMessage=await _chatService.SendMessageAsync(senderId,dto);

        await _hubContext.Clients
                        .Users(sentMessage.ReceiverId.ToString())
                        .SendAsync("New Message",sentMessage);

        return Ok(sentMessage);
    }

    [HttpGet("message/my")]
    public async Task<IActionResult> ReceiveMessageAsync()
    {
        var userClaim=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(userClaim,out int receiverId))
        {
            return Unauthorized();
        }

        var message=await _chatService.ViewMyMessageAsync(receiverId);

        return Ok(message);
    }

    [HttpGet("conversation/{otherUserId}")]
    public async Task<IActionResult> ViewMyConversation(int otherUserId)
    {
        var user=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(user,out int userId))
        {
            return Unauthorized();
        }

        var conversation=await _chatService.ViewConversationAsync(userId,otherUserId);
        return Ok(conversation);
    }

    [HttpPatch("conversation/{senderId}/read")]
    public async Task<IActionResult> ReadMessage(int senderId)
    {
        var receiver=User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!int.TryParse(receiver,out int receiverId))
        {
            return Unauthorized();
        }

        await _chatService.MarkAsReadAsync(senderId,receiverId);

        return NoContent();
    }
}