
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY BMS.API/BMS.API.csproj BMS.API/
COPY BMS.Application/BMS.Application.csproj BMS.Application/
COPY BMS.Domain/BMS.Domain.csproj BMS.Domain/
COPY BMS.Infrastructure/BMS.Infrastructure.csproj BMS.Infrastructure/

RUN dotnet restore BMS.API/BMS.API.csproj

COPY . .

RUN dotnet publish BMS.API/BMS.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "BMS.API.dll"]
