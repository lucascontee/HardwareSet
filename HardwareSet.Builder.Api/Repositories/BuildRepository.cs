using System.Collections.Concurrent;
using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Repositories;

public class BuildRepository : IBuildRepository
{
    // TODO: Substituir o dicionário em memória abaixo pelo Redis (IDistributedCache / StackExchange.Redis),
    // serializando a sessão em JSON com chave "build:{id}" e aplicando TTL configurável (ex: 120 minutos).
    private static readonly ConcurrentDictionary<string, BuildSession> InMemorySessions = new(StringComparer.OrdinalIgnoreCase);

    public Task<BuildSession?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        // TODO: Buscar no Redis via _distributedCache.GetStringAsync($"build:{id}", cancellationToken)
        InMemorySessions.TryGetValue(id, out var session);
        return Task.FromResult(session);
    }

    public Task<BuildSession> SaveAsync(BuildSession session, CancellationToken cancellationToken = default)
    {
        // TODO: Salvar no Redis via _distributedCache.SetStringAsync($"build:{session.Id}", json, DistributedCacheEntryOptions, cancellationToken)
        session.UpdatedAt = DateTime.UtcNow;
        InMemorySessions[session.Id] = session;
        return Task.FromResult(session);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        // TODO: Remover chave no Redis via _distributedCache.RemoveAsync($"build:{id}", cancellationToken)
        var removed = InMemorySessions.TryRemove(id, out _);
        return Task.FromResult(removed);
    }
}
