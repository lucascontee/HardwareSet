using System.Text.Json;
using HardwareSet.Builder.Api.Data;
using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Repositories;

public class BuildRepository : IBuildRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly RedisDbContext _dbContext;

    public BuildRepository(RedisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BuildSession?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var redisValue = await _dbContext.Database.StringGetAsync(_dbContext.GetBuildKey(id));
        if (redisValue.IsNullOrEmpty)
        {
            return null;
        }

        return JsonSerializer.Deserialize<BuildSession>(redisValue.ToString(), JsonOptions);
    }

    public async Task<BuildSession> SaveAsync(BuildSession session, CancellationToken cancellationToken = default)
    {
        session.UpdatedAt = DateTime.UtcNow;
        var json = JsonSerializer.Serialize(session, JsonOptions);

        await _dbContext.Database.StringSetAsync(
            _dbContext.GetBuildKey(session.Id),
            json,
            _dbContext.DefaultExpiry);

        return session;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Database.KeyDeleteAsync(_dbContext.GetBuildKey(id));
    }
}
