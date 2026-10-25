namespace BMS.Application.Dtos;

public class ReceiveMessageDto
{
    public string Message{get;set;}=string.Empty;
    public int SenderId{get;set;}
    public bool isRead{get;set;}
    public int ReceiverId{get;set;}
    
}