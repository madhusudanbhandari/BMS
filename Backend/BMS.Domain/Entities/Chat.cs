using System.Threading.Tasks.Dataflow;

namespace BMS.Domain.Entities;

public class Chat
{
    public int Id{get;set;}
    public string Message{get;set;}=string.Empty;
    public int SenderId{get;set;}
    public User? Sender{get;set;}
    public int ReceiverId{get;set;}
    public User? Receiver{get;set;}

    public DateTime SentAt{get;set;}
    public bool isRead{get;set;}
}