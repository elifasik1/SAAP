using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SAAP.Application.Common.Interfaces;
using SAAP.Infrastructure.Services;

namespace SAAP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ITokenService, TokenService>();

        return services;
    }
}
