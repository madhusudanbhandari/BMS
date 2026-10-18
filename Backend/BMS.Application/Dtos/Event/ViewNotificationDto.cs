namespace BMS.Application.Dtos;

public class ViewNotificationDto
{
    public int Id{get;set;}
    public string Title{get;set;}=string.Empty;
    public string Message{get;set;}=string.Empty;
    public bool isRead{get;set;}
    public DateTime CreatedAt{get;set;}
}