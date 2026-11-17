using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Services;

public interface IBuilderService
{
    Task<BuildSession> CreateSessionAsync(CreateBuildRequest? request, CancellationToken cancellationToken = default);
    Task<BuildSession?> GetSessionByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<BuildSession?> SelectComponentAsync(string buildId, string category, SelectComponentRequest request, CancellationToken cancellationToken = default);
    Task<BuildSession?> RemoveComponentAsync(string buildId, string category, CancellationToken cancellationToken = default);
    Task<bool> DeleteSessionAsync(string id, CancellationToken cancellationToken = default);
    ValidateBuildResponse ValidateStandalone(IEnumerable<BuildComponent> components);
}
