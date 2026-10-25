using AutoMapper;
using BMS.Application.Dtos;
using BMS.Application.Interface;
using BMS.Domain.Entities;

namespace BMS.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Project,ViewProjectDto>();
        CreateMap<User,ViewPendingUser>();
        CreateMap<Attendence, ViewAttendenceDto>();
    }
}