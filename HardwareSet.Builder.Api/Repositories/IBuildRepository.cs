using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Repositories;

public interface IBuildRepository
{
    Task<BuildSession?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<BuildSession> SaveAsync(BuildSession session, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
