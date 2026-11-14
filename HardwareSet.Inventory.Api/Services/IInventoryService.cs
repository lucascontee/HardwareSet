using HardwareSet.Inventory.Api.Entities;
using HardwareSet.Inventory.Api.Models;

namespace HardwareSet.Inventory.Api.Services;

public interface IInventoryService
{
    Task<IEnumerable<InventoryItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<InventoryItem?> GetByProductIdAsync(string productId, CancellationToken cancellationToken = default);
    Task<InventoryItem> InitializeProductStockAsync(CreateInventoryItemRequest request, CancellationToken cancellationToken = default);
    Task<InventoryItem?> AdjustStockAsync(string productId, int quantityDelta, CancellationToken cancellationToken = default);
    Task<ReserveBatchResponse> ReserveBatchAsync(IReadOnlyList<ReserveStockItemDto> items, CancellationToken cancellationToken = default);
}
