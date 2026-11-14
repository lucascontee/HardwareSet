using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace HardwareSet.Builder.Api.Data;

public class RedisDbContext : IDisposable
{
    private readonly ConnectionMultiplexer _muxer;
    private readonly IDatabase _database;
    private readonly RedisDbSettings _settings;

    public RedisDbContext(IOptions<RedisDbSettings> settings)
    {
        _settings = settings.Value;
        _muxer = ConnectionMultiplexer.Connect(_settings.ConnectionString);
        _database = _muxer.GetDatabase();
    }

    public IDatabase Database => _database;

    public TimeSpan DefaultExpiry => TimeSpan.FromMinutes(
        _settings.DefaultTtlMinutes > 0 ? _settings.DefaultTtlMinutes : 120);

    public RedisKey GetBuildKey(string id) =>
        $"{_settings.InstanceName}build:{id}";

    public void Dispose()
    {
        _muxer.Dispose();
    }
}
