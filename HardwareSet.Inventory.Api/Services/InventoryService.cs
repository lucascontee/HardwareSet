using HardwareSet.Inventory.Api.Entities;
using HardwareSet.Inventory.Api.Models;
using HardwareSet.Inventory.Api.Repositories;

namespace HardwareSet.Inventory.Api.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repository;

    public InventoryService(IInventoryRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<InventoryItem>> GetAllAsync(CancellationToken cancellationToken = default) =>
        _repository.GetAllAsync(cancellationToken);

    public Task<InventoryItem?> GetByProductIdAsync(string productId, CancellationToken cancellationToken = default) =>
        _repository.GetByProductIdAsync(productId, cancellationToken);

    /// <summary>
    /// Inicializa o registro de estoque de uma peça de forma idempotente (seguro para reprocessamento de mensagens).
    /// </summary>
    public async Task<InventoryItem> InitializeProductStockAsync(
        CreateInventoryItemRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByProductIdAsync(request.ProductId, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var item = new InventoryItem
        {
            ProductId = request.ProductId.Trim(),
            ProductName = request.ProductName.Trim(),
            Category = request.Category.Trim().ToLowerInvariant(),
            AvailableQuantity = Math.Max(0, request.InitialQuantity),
            ReservedQuantity = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _repository.CreateAsync(item, cancellationToken);
    }

    public async Task<InventoryItem?> AdjustStockAsync(
        string productId,
        int quantityDelta,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByProductIdAsync(productId, cancellationToken);
        if (existing is null)
        {
            return null;
        }

        var newQuantity = existing.AvailableQuantity + quantityDelta;
        if (newQuantity < 0)
        {
            throw new InvalidOperationException(
                $"Operação inválida: o estoque disponível de '{existing.ProductName}' ({existing.AvailableQuantity}) ficaria negativo.");
        }

        existing.AvailableQuantity = newQuantity;
        return await _repository.UpdateAsync(existing, cancellationToken);
    }

    public Task<ReserveBatchResponse> ReserveBatchAsync(
        IReadOnlyList<ReserveStockItemDto> items,
        CancellationToken cancellationToken = default) =>
        _repository.ReserveBatchAsync(items, cancellationToken);
}
