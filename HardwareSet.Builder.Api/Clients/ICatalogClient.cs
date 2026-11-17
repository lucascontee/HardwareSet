using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Clients;

public interface ICatalogClient
{
    Task<BuildComponent?> GetProductByIdAsync(string productId, CancellationToken cancellationToken = default);
}
