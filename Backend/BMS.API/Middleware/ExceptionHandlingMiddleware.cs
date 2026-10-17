using System.Text.Json;
using BMS.Application.Exceptions;

namespace BMS.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Unhandled exception for {Method} {Path}. TraceId: {TraceId}",
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier);

            if (context.Response.HasStarted)
            {
                throw;
            }

            context.Response.Clear();
            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                NotFoundException =>
                    (StatusCodes.Status404NotFound, exception.Message),

                ForbiddenException =>
                    (StatusCodes.Status403Forbidden, exception.Message),

                ConflictException =>
                    (StatusCodes.Status409Conflict, exception.Message),

                BadRequestException =>
                    (StatusCodes.Status400BadRequest, exception.Message),

                ArgumentException =>
                    (StatusCodes.Status400BadRequest, exception.Message),

                _ =>
                    (
                        StatusCodes.Status500InternalServerError,
                        "An unexpected error occurred."
                    )
            };

            context.Response.StatusCode = statusCode;

            var response = new
            {
                status = statusCode,
                message,
                traceId = context.TraceIdentifier
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response));
        }
    }
}
