using HardwareSet.Inventory.Api.Data;
using HardwareSet.Inventory.Api.Entities;
using HardwareSet.Inventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HardwareSet.Inventory.Api.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly InventoryDbContext _dbContext;

    public InventoryRepository(InventoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.InventoryItems
            .AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.ProductName)
            .ToListAsync(cancellationToken);
    }

    public async Task<InventoryItem?> GetByProductIdAsync(string productId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.InventoryItems
            .FirstOrDefaultAsync(x => x.ProductId == productId, cancellationToken);
    }

    public async Task<InventoryItem> CreateAsync(InventoryItem item, CancellationToken cancellationToken = default)
    {
        _dbContext.InventoryItems.Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<InventoryItem> UpdateAsync(InventoryItem item, CancellationToken cancellationToken = default)
    {
        item.UpdatedAt = DateTime.UtcNow;
        _dbContext.InventoryItems.Update(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<ReserveBatchResponse> ReserveBatchAsync(
        IReadOnlyList<ReserveStockItemDto> items,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var stockItems = await _dbContext.InventoryItems
            .Where(x => productIds.Contains(x.ProductId))
            .ToDictionaryAsync(x => x.ProductId, cancellationToken);

        var unavailableIds = new List<string>();

        foreach (var reqItem in items)
        {
            if (!stockItems.TryGetValue(reqItem.ProductId, out var stock) ||
                stock.AvailableQuantity < reqItem.Quantity)
            {
                unavailableIds.Add(reqItem.ProductId);
            }
        }

        if (unavailableIds.Count > 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return new ReserveBatchResponse
            {
                Success = false,
                Message = "Um ou mais componentes não possuem estoque suficiente para reserva.",
                UnavailableProductIds = unavailableIds
            };
        }

        foreach (var reqItem in items)
        {
            var stock = stockItems[reqItem.ProductId];
            stock.AvailableQuantity -= reqItem.Quantity;
            stock.ReservedQuantity += reqItem.Quantity;
            stock.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new ReserveBatchResponse
        {
            Success = true,
            Message = "Estoque reservado com sucesso para todos os componentes."
        };
    }
}
