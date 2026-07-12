using Microsoft.EntityFrameworkCore;
using SAAP.Infrastructure.Persistence;
using StackExchange.Redis;
using SAAP.Infrastructure.Caching;
using SAAP.API.Middleware;
using Serilog;
using Microsoft.AspNetCore.Identity;
using SAAP.Domain.Entities;
using SAAP.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using Scalar.AspNetCore;

// Serilog yapılandırması
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();

// Servislerin tanımlanması
var redisConnectionString = builder.Configuration.GetSection("RedisSettings:ConnectionString").Value ?? "localhost:6379";
var redisOptions = ConfigurationOptions.Parse(redisConnectionString);
redisOptions.AbortOnConnectFail = false;
var redis = ConnectionMultiplexer.Connect(redisOptions);
builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
builder.Services.AddScoped<RedisRateLimiterService>();

builder.Services.AddDbContext<SaapDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// .NET 10 Modern OpenAPI Servisi
builder.Services.AddOpenApi(); 

// Register Identity
builder.Services.AddIdentity<User, SAAP.Domain.Entities.Role>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<SaapDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddInfrastructureServices(builder.Configuration);

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? jwtSettings["SecretKey"] ?? "A_Very_Strong_And_Secret_Key_For_Development_SAAP_Project_2026";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "SAAP.API",
        ValidAudience = jwtSettings["Audience"] ?? "SAAP.API.Users",
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
              .AllowAnyHeader()
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});

var app = builder.Build();

// Database initialization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SaapDbContext>();
    dbContext.Database.EnsureCreated();

    await dbContext.Database.ExecuteSqlRawAsync("""
        ALTER TABLE "AuditLogs" ADD COLUMN IF NOT EXISTS "UserId" uuid NULL;
        ALTER TABLE "AuditLogs" ADD COLUMN IF NOT EXISTS "UserEmail" text NULL;
        ALTER TABLE "AuditLogs" ADD COLUMN IF NOT EXISTS "HttpMethod" text NOT NULL DEFAULT 'GET';
        ALTER TABLE "AspNetUsers" ADD COLUMN IF NOT EXISTS "AvatarUrl" text NULL;
        CREATE TABLE IF NOT EXISTS "UserSecuritySettings" (
            "UserId" uuid PRIMARY KEY,
            "TwoFactorEnabled" boolean NOT NULL,
            "SessionLockEnabled" boolean NOT NULL,
            "IpWhitelistEnabled" boolean NOT NULL,
            "AuditNotificationsEnabled" boolean NOT NULL,
            "ApiKeyRotationEnabled" boolean NOT NULL,
            "UpdatedAt" timestamp with time zone NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Notifications" (
            "Id" uuid PRIMARY KEY,
            "UserId" uuid NOT NULL,
            "Type" text NOT NULL,
            "Message" text NOT NULL,
            "IsRead" boolean NOT NULL,
            "CreatedAt" timestamp with time zone NOT NULL
        );
        CREATE INDEX IF NOT EXISTS "IX_Notifications_UserId_CreatedAt" ON "Notifications" ("UserId", "CreatedAt");
        """);
}

// HTTP İstek Hattı (Modern OpenAPI & Scalar UI)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // Tarayıcıda /scalar/v1 adresinden erişebilirsin
}

app.UseCors("AllowFrontend");

app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<AuditLoggingMiddleware>();
app.MapControllers();

app.MapGet("/weatherforecast", () =>
{
    var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };
    return Enumerable.Range(1, 5).Select(index => new WeatherForecast(
        DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
        Random.Shared.Next(-20, 55),
        summaries[Random.Shared.Next(summaries.Length)]
    )).ToArray();
}).RequireCors("AllowFrontend").WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
