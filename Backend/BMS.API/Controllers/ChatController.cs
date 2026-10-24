using System.Security.Claims;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BMS.Api.Controller;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    public ChatController(IChatService chatService)
    {
        _chatService=chatService;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessageAsync(SendMessageDto dto)
    {
        var userClaim=User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(!int.TryParse(userClaim,out int senderId))
        {
            return Unauthorized();
        }

        var sentMessage=await _chatService.SendMessageAsync(senderId,dto);
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
}