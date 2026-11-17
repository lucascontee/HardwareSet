using HardwareSet.Contracts.Events;
using HardwareSet.Inventory.Api.Models;
using HardwareSet.Inventory.Api.Services;
using MassTransit;

namespace HardwareSet.Inventory.Api.Consumers;

/// <summary>
/// Consumidor responsável pela Transação Compensatória (Rollback distribuído):
/// Devolve ao estoque disponível as peças reservadas caso o pagamento do pedido seja recusado.
/// </summary>
public class ReleaseOrderStockConsumer : IConsumer<ReleaseOrderStockCommand>
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<ReleaseOrderStockConsumer> _logger;

    public ReleaseOrderStockConsumer(
        IInventoryService inventoryService,
        ILogger<ReleaseOrderStockConsumer> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ReleaseOrderStockCommand> context)
    {
        var command = context.Message;

        _logger.LogWarning(
            "Executando transação compensatória (estorno de estoque) para o pedido {OrderId}. Motivo: {Reason}",
            command.OrderId,
            command.Reason);

        var dtos = command.Items.Select(i => new ReserveStockItemDto
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            Category = i.Category,
            Quantity = i.Quantity
        }).ToList();

        await _inventoryService.ReleaseBatchAsync(dtos, context.CancellationToken);

        _logger.LogInformation(
            "Estoque estornado com sucesso para o pedido {OrderId}.",
            command.OrderId);
    }
}
