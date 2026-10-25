using BMS.Application.Dtos;
using BMS.Application.Exceptions;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BMS.Application.Service;


public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IAuthRepository _authRepository;

    public ChatService(IChatRepository chatRepository,IAuthRepository authRepository)
    {
        _chatRepository=chatRepository;
        _authRepository=authRepository;
    }

    public async Task<ViewMessageDto> SendMessageAsync(int senderId,SendMessageDto dto)
    {
        var sender=await _authRepository.GetUserByIdAsync(senderId);

        if (sender == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var receiver=await _authRepository.GetUserByIdAsync(dto.ReceiverId);

        if (receiver == null)
        {
            throw new NotFoundException("Cannot find the receiver");
        }

        if (sender.OrganizationId != receiver.OrganizationId)
        {
            throw new BadRequestException("You 2 belong to different organizations");
        }

        var chat=new Chat
        {
            SenderId=sender.Id,
            ReceiverId=receiver.Id,
            Message=dto.Message,
            SentAt=DateTime.UtcNow,
            isRead=false
        };

        await _chatRepository.AddMessageAsync(chat);
        await _chatRepository.SaveChangesAsync();

        return new ViewMessageDto
        {
            Id=chat.Id,
            SenderId=chat.SenderId,
            ReceiverId=chat.ReceiverId,
            Message=chat.Message,
            SentAt=chat.SentAt,
            isRead=chat.isRead
        };
    }

    public async Task<List<ReceiveMessageDto>> ViewMyMessageAsync(int receiverId)
    {
        var messages=await _chatRepository.ViewMyMessageAsync(receiverId);

        return messages.Select(message=>new ReceiveMessageDto
        {
            Message=message.Message,
            SenderId=message.SenderId,
            ReceiverId=message.ReceiverId,
            isRead=message.isRead
        }).ToList();

    }

    public async Task<List<ReceiveMessageDto>> ViewConversationAsync(int userId,int otherUserId)
    {
        var userOne=await _authRepository.GetUserByIdAsync(userId);
        if (userOne == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var userTwo=await _authRepository.GetUserByIdAsync(otherUserId);

        if (userTwo == null)
        {
            throw new NotFoundException("Cannot find the user");
        }


        if (userOne.OrganizationId != userTwo.OrganizationId)
        {
            throw new BadRequestException("Both users dont belong to same organization");
        }

        var conversations=await _chatRepository.ViewConversationAsync(userOne.Id,userTwo.Id);

        return conversations.Select(conversation=> new ReceiveMessageDto
        {
            Message=conversation.Message,
            SenderId=conversation.SenderId
        }).ToList();
    }

    public async Task MarkAsReadAsync(int senderId,int receiverId)
    {
        var sender=await _authRepository.GetUserByIdAsync(senderId);
        if (sender == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        var receiver=await _authRepository.GetUserByIdAsync(receiverId);
        if (receiver == null)
        {
            throw new NotFoundException("Cannot find the user");
        }

        if (sender.OrganizationId != receiver.OrganizationId)
        {
            throw new BadRequestException("Dont belong to same organization");
        }

        var unreadMessages=await _chatRepository.ViewUnreadMessages(sender.Id,receiver.Id);

        foreach(var unreadMessage in unreadMessages)
        {
            unreadMessage.isRead=true;
        }

        await _chatRepository.SaveChangesAsync();


    }
}