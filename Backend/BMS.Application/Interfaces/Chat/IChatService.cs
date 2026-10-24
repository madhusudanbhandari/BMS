using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface IChatService
{
    Task<ViewMessageDto> SendMessageAsync(int senderId,SendMessageDto dto);
    Task<List<ReceiveMessageDto>> ViewMyMessageAsync(int userId);


}