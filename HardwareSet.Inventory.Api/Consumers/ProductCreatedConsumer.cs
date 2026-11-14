using HardwareSet.Contracts.Events;
using HardwareSet.Inventory.Api.Models;
using HardwareSet.Inventory.Api.Services;
using MassTransit;

namespace HardwareSet.Inventory.Api.Consumers;

public class ProductCreatedConsumer : IConsumer<ProductCreatedEvent>
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<ProductCreatedConsumer> _logger;

    public ProductCreatedConsumer(
        IInventoryService inventoryService,
        ILogger<ProductCreatedConsumer> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProductCreatedEvent> context)
    {
        var message = context.Message;

        _logger.LogInformation(
            "Evento ProductCreatedEvent recebido para o produto {ProductId} ({Name}). Inicializando estoque...",
            message.ProductId,
            message.Name);

        await _inventoryService.InitializeProductStockAsync(new CreateInventoryItemRequest
        {
            ProductId = message.ProductId,
            ProductName = message.Name,
            Category = message.Category,
            InitialQuantity = message.InitialQuantity
        }, context.CancellationToken);
    }
}
