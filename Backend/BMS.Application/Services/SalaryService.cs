using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Service;

public class SalaryService : ISalaryService
{
    private readonly ISalaryRepository _salaryRepository; 
    private readonly IAuthRepository _authRepository ;   
    public SalaryService(ISalaryRepository salaryRepository,IAuthRepository authRepository)
    {
        _salaryRepository=salaryRepository;
        _authRepository=authRepository;
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

        if (salary.SalaryStatus != Domain.Entities.Enums.SalaryStatus.Pending)
        {
            throw new InvalidOperationException("Only pending salaries can be reviewed");
        }

        if(dto.SalaryStatus!=Domain.Entities.Enums.SalaryStatus.Released && dto.SalaryStatus != Domain.Entities.Enums.SalaryStatus.Rejected)
        {
            throw new ArgumentException("Hr can only release or reject the salary");
        }

        salary.SalaryStatus=dto.SalaryStatus;
        salary.ReleasedAt=dto.SalaryStatus==Domain.Entities.Enums.SalaryStatus.Released ? DateTime.UtcNow: null;

        await _salaryRepository.SaveChangesAsync();

        return new ViewSalaryDto
        {
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
}