namespace BMS.Application.Dtos;


public class ViewMessageDto
{
    public int Id{get;set;}
    public string Message{get;set;}=string.Empty;
    public int SenderId{get;set;}
    public int ReceiverId{get;set;}
    public DateTime SentAt{get;set;}
    public bool isRead{get;set;}
}