using HardwareSet.Contracts.Events;
using HardwareSet.Order.Api.Entities;
using HardwareSet.Order.Api.Models;
using HardwareSet.Order.Api.Repositories;
using MassTransit;

namespace HardwareSet.Order.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderService(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
    {
        _orderRepository = orderRepository;
        _publishEndpoint = publishEndpoint;
    }

    public Task<IEnumerable<Entities.Order>> GetAllAsync(CancellationToken cancellationToken = default) =>
        _orderRepository.GetAllAsync(cancellationToken);

    public Task<Entities.Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _orderRepository.GetByIdAsync(id, cancellationToken);

    public async Task<Entities.Order> CreateOrderAndStartSagaAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var orderId = Guid.NewGuid();
        var items = request.Items.Select(i => new OrderItem
        {
            OrderId = orderId,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            Category = i.Category.ToLowerInvariant(),
            UnitPrice = i.UnitPrice,
            Quantity = Math.Max(1, i.Quantity)
        }).ToList();

        var rawTotal = items.Sum(i => i.UnitPrice * i.Quantity);
        var finalTotal = string.Equals(request.PaymentMethod, "pix", StringComparison.OrdinalIgnoreCase)
            ? Math.Round(rawTotal * 0.90m, 2)
            : rawTotal;

        var order = new Entities.Order
        {
            Id = orderId,
            CustomerName = string.IsNullOrWhiteSpace(request.CustomerName)
                ? "Cliente HardwareSet"
                : request.CustomerName.Trim(),
            PaymentMethod = request.PaymentMethod.Trim().ToLowerInvariant(),
            Status = OrderStatus.Pending,
            StatusMessage = "Pedido recebido. Validando disponibilidade de estoque e pagamento...",
            TotalAmount = finalTotal,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Items = items
        };

        await _orderRepository.CreateAsync(order, cancellationToken);

        await _publishEndpoint.Publish(new OrderSubmittedEvent
        {
            OrderId = order.Id,
            CustomerName = order.CustomerName,
            PaymentMethod = order.PaymentMethod,
            SimulatePaymentFailure = request.SimulatePaymentFailure,
            TotalAmount = order.TotalAmount,
            Items = items.Select(i => new OrderLineItemContract
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Category = i.Category,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity
            }).ToList(),
            SubmittedAt = DateTime.UtcNow
        }, cancellationToken);

        // Aguarda brevemente o processamento assíncrono da Saga (até 2,5s) para já retornar o desfecho atualizado
        for (var attempt = 0; attempt < 15; attempt++)
        {
            await Task.Delay(160, cancellationToken);
            var updated = await _orderRepository.GetByIdAsync(order.Id, cancellationToken);
            if (updated is not null && IsTerminalStatus(updated.Status))
            {
                return updated;
            }
        }

        return await _orderRepository.GetByIdAsync(order.Id, cancellationToken) ?? order;
    }

    private static bool IsTerminalStatus(OrderStatus status) =>
        status is OrderStatus.Confirmed
            or OrderStatus.FailedOutOfStock
            or OrderStatus.FailedPaymentCompensated;
}
