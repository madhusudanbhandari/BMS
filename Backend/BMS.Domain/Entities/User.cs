using BMS.Domain.Entities.Enums;

namespace BMS.Domain.Entities;

public class User
{
    public int Id{get;set;}
    public string FirstName{get;set;}=string.Empty;
    public string LastName{get;set;}=string.Empty;
    public string Email{get;set;}=string.Empty;
    public string Password{get;set;}=string.Empty;
    public UserRoles Role{get;set;}
    public int OrganizationId{get;set;}
    public Organization Organization{get;set;}=null!;

    public UserStatus Status{get;set;}
    public ICollection<Team> Teams{get;set;}=new List<Team>();
    public ICollection<Attendence> Attendences{get;set;}=new List<Attendence>();
    public ICollection<Leave> Leaves{get;set;}=new List<Leave>();
    public ICollection<Salary> Salaries{get;set;}=new List<Salary>();
    public ICollection<Chat> Chats{get;set;}=new List<Chat>();
}