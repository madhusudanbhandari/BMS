using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BMS.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    
}