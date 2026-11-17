using HardwareSet.Contracts.Events;
using HardwareSet.Inventory.Api.Models;
using HardwareSet.Inventory.Api.Services;
using MassTransit;

namespace HardwareSet.Inventory.Api.Consumers;

public class ReserveOrderStockConsumer : IConsumer<ReserveOrderStockCommand>
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<ReserveOrderStockConsumer> _logger;

    public ReserveOrderStockConsumer(
        IInventoryService inventoryService,
        ILogger<ReserveOrderStockConsumer> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ReserveOrderStockCommand> context)
    {
        var command = context.Message;
        _logger.LogInformation(
            "Iniciando reserva de estoque para o pedido {OrderId} ({Count} peças)...",
            command.OrderId,
            command.Items.Count);

        var dtos = command.Items.Select(i => new ReserveStockItemDto
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            Category = i.Category,
            Quantity = i.Quantity
        }).ToList();

        var result = await _inventoryService.ReserveBatchAsync(dtos, context.CancellationToken);

        if (result.Success)
        {
            _logger.LogInformation("Estoque reservado com sucesso para o pedido {OrderId}.", command.OrderId);
            await context.Publish(new OrderStockReservedEvent
            {
                OrderId = command.OrderId,
                ReservedAt = DateTime.UtcNow
            }, context.CancellationToken);
        }
        else
        {
            _logger.LogWarning(
                "Falha na reserva de estoque do pedido {OrderId}: {Reason}",
                command.OrderId,
                result.Message);

            await context.Publish(new OrderStockReservationFailedEvent
            {
                OrderId = command.OrderId,
                Reason = result.Message,
                UnavailableProductIds = result.UnavailableProductIds,
                FailedAt = DateTime.UtcNow
            }, context.CancellationToken);
        }
    }
}
