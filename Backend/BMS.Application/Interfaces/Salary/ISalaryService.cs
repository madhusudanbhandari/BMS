using BMS.Application.Dtos;
using BMS.Domain.Entities.Enums;

namespace BMS.Application.Interface;

public interface ISalaryService
{
    public Task<ViewSalaryDto> RequestSalaryAsync(int userId,RequestSalaryDto dto);

    public Task<ViewSalaryDto> UpdateSalaryAsync(int hrId,int empId,int salaryId,UpdateSalaryDto dto);
    
    public Task<PagedResponseDto> ViewAllSalaryRequests(int hrId,int page,int pageSize,SalaryStatus? salaryStatus);
    public Task<PagedResponseDto> ViewAllMySalaries(int employeeId,int page,int pageSize,SalaryStatus? salaryStatus);

}