using StackExchange.Redis;

namespace SAAP.Infrastructure.Caching;

public class RedisRateLimiterService
{
    private readonly IConnectionMultiplexer _redis;
    
    public RedisRateLimiterService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<bool> IsAllowedAsync(string ipAddress, int limit = 10, int windowSeconds = 60)
    {
        var db = _redis.GetDatabase();
        var key = $"ratelimit:{ipAddress}";

        var count = await db.StringIncrementAsync(key);
        if (count == 1)
        {
            await db.KeyExpireAsync(key, TimeSpan.FromSeconds(windowSeconds));
        }

        return count <= limit;
    }
}