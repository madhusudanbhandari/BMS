using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class Leave
{
    public int Id{get;set;}
    public int userId{get;set;}
    public User? User{get;set;}

    public string Reason{get;set;}=string.Empty;
    public DateTime From{get;set;}
    public DateTime To{get;set;}

    public User? ReviewedById{get;set;}

    public LeaveStatus LeaveStatus{get;set;}

}