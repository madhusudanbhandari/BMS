using BMS.Application.Dtos;

namespace BMS.Application.Interface;

public interface ISalaryService
{
    public Task<ViewSalaryDto> RequestSalaryAsync(int userId,RequestSalaryDto dto);

    public Task<ViewSalaryDto> UpdateSalaryAsync(int hrId,int empId,int salaryId,UpdateSalaryDto dto);
    


}