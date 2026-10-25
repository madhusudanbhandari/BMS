using BMS.Application.Dtos;
using BMS.Application.Exceptions;
using BMS.Application.Interface;
using BMS.Domain.Entities;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Service;

public class SalaryService : ISalaryService
{
    private readonly ISalaryRepository _salaryRepository; 
    private readonly IAuthRepository _authRepository ;   
    private readonly IEventNotificationService _eventNotificationService;
    public SalaryService(ISalaryRepository salaryRepository,IAuthRepository authRepository,IEventNotificationService eventNotificationService)
    {
        _salaryRepository=salaryRepository;
        _authRepository=authRepository;
        _eventNotificationService=eventNotificationService;
    }

    public async Task<ViewSalaryDto> RequestSalaryAsync(int userId,RequestSalaryDto dto)
    {
        if (dto.Amount <= 0)
        {
            throw new Exception("salary must be positive");
        }
        var salary=new Salary
        {
            UserId=userId,
            Amount=dto.Amount,
            Duration=dto.Duration,
            SalaryStatus=Domain.Entities.Enums.SalaryStatus.Pending,
            AccountName=dto.AccountName,
            AccountNumber=dto.AccountNumber,
            RequestedAt=DateTime.UtcNow,
            ReleasedAt=null,
        };

        await _salaryRepository.AddSalary(salary);
    
    

        await _salaryRepository.SaveChangesAsync();

        return new ViewSalaryDto
        {
            Id=salary.Id,
            UserId=userId,
            Amount=salary.Amount,
            Duration=salary.Duration,
            SalaryStatus=salary.SalaryStatus,
            AccountName=salary.AccountName,
            AccountNumber=salary.AccountNumber,
            RequestedAt=salary.RequestedAt,
            ReleasedAt=salary.ReleasedAt?? null,
        };
    }

    public async Task<ViewSalaryDto> UpdateSalaryAsync(int hrId,int empId,int salaryId,UpdateSalaryDto dto)
    {
        var hr=await _authRepository.GetUserByIdAsync(hrId);

        if (hr == null)
        {
            throw new KeyNotFoundException("Cannot find the HR");
        }
        var hrOrg=hr?.OrganizationId;

        var employeeId=await _authRepository.GetUserByIdAsync(empId);

        if (employeeId == null)
        {
            throw new Exception("Cannot find the employee");

        }
        var empOrg=employeeId.OrganizationId;
        if (hrOrg != empOrg)
        {
            throw new Exception("you dont belong to same organization");
        }

        var salary=await _salaryRepository.GetSalaryAsync(salaryId);

        if (salary == null)
        {
            throw new Exception("Salary cannot be found");
        }

        var salaryUser=salary.UserId;

        if (salaryUser!=empId)
        {
            throw new Exception("You cannot control this salary");
        }

        if (salary.SalaryStatus != SalaryStatus.Pending)
        {
            throw new ConflictException("Only pending salaries can be reviewed");
        }

        if(dto.SalaryStatus!=SalaryStatus.Released && dto.SalaryStatus != SalaryStatus.Rejected)
        {
            throw new ArgumentException("Hr can only release or reject the salary");
        }

        salary.SalaryStatus=dto.SalaryStatus;
        salary.ReleasedAt=dto.SalaryStatus==SalaryStatus.Released ? DateTime.UtcNow: null;

        await _salaryRepository.SaveChangesAsync();

        return new ViewSalaryDto
        {
            Id=salary.Id,
            UserId=salary.UserId,
            Amount=salary.Amount,
            Duration=salary.Duration,
            SalaryStatus=salary.SalaryStatus,
            RequestedAt=salary.RequestedAt,
            AccountName=salary.AccountName,
            AccountNumber=salary.AccountNumber,
            ReleasedAt=salary.ReleasedAt
        };


    }

    public async Task<PagedResponseDto> ViewAllSalaryRequests(int hrId,int page,int PageSize,SalaryStatus? salaryStatus)
    {
        if (page < 1)
        {
            throw new Exception("page cannot be less then 1");
        }

        if(PageSize<1 || PageSize > 100)
        {
            throw new Exception("Page must be between 1 and 100");
        }

        var hr=await _authRepository.GetUserByIdAsync(hrId);
        if (hr == null)
        {
            throw new Exception("Cannot find the hr");
        }
        var hrOrg=hr.OrganizationId;

        var (items,totalCount)=await _salaryRepository.GetAllSalariesByOrgId(hrOrg,page,PageSize,salaryStatus);

        return new PagedResponseDto
        {
            PageNo=page,
            PageSize=PageSize,
            TotalCount=totalCount,
            TotalPage=(int) Math.Ceiling(totalCount/(double) PageSize),

            Items=items.Select(salary=>new ViewSalaryDto
            {
                Id=salary.Id,
                UserId=salary.UserId,
                Amount=salary.Amount,
                Duration=salary.Duration,
                SalaryStatus=salary.SalaryStatus,
                RequestedAt=salary.RequestedAt,
                AccountName=salary.AccountName,
                AccountNumber=salary.AccountNumber,
                ReleasedAt=salary.ReleasedAt
            }).ToList()
        };
    }

    public async Task<PagedResponseDto> ViewAllMySalaries(int empId,int page,int pageSize,SalaryStatus? salaryStatus)
        {

        if (page < 1)
        {
            throw new Exception("Page cannot be less than 1");
        }

        if(pageSize<1 || pageSize > 100)
        {
            throw new Exception("Page size must be between 1 and 100");
        }


        var (items,totalCount)=await _salaryRepository.GetAllOfMySalaries(empId,page,pageSize,salaryStatus);

        return new PagedResponseDto
        {
            PageNo=page,
            PageSize=pageSize,
            TotalCount=totalCount,
            TotalPage=(int) Math.Ceiling(totalCount/(double)pageSize),

            Items=items.Select(salary=>new ViewSalaryDto
            {
                Id=salary.Id,
                UserId=salary.UserId,
                Amount=salary.Amount,
                Duration=salary.Duration,
                SalaryStatus=salary.SalaryStatus,
                RequestedAt=salary.RequestedAt,
                AccountName=salary.AccountName,
                AccountNumber=salary.AccountNumber,
                ReleasedAt=salary.ReleasedAt
            }).ToList()
        };
    }

}