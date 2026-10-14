namespace BMS.Application.Dtos;

public class PagedResponseDto
{
    public List<ViewSalaryDto> Items{get;set;}=new();
    public List<ViewPendingUser> Users{get;set;}=new();
    
    public int PageSize{get;set;}
    public int PageNo{get;set;}
    public int TotalPage{get;set;}
    public int TotalCount{get;set;}
}