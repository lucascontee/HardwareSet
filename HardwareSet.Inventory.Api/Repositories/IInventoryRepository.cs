using HardwareSet.Inventory.Api.Entities;
using HardwareSet.Inventory.Api.Models;

namespace HardwareSet.Inventory.Api.Repositories;

public interface IInventoryRepository
{
    Task<IEnumerable<InventoryItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<InventoryItem?> GetByProductIdAsync(string productId, CancellationToken cancellationToken = default);
    Task<InventoryItem> CreateAsync(InventoryItem item, CancellationToken cancellationToken = default);
    Task<InventoryItem> UpdateAsync(InventoryItem item, CancellationToken cancellationToken = default);
    Task<ReserveBatchResponse> ReserveBatchAsync(IReadOnlyList<ReserveStockItemDto> items, CancellationToken cancellationToken = default);
}
