using HardwareSet.Order.Api.Entities;

namespace HardwareSet.Order.Api.Repositories;

public interface IOrderRepository
{
    Task<IEnumerable<Entities.Order>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Entities.Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Entities.Order> CreateAsync(Entities.Order order, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(
        Guid orderId,
        OrderStatus status,
        string statusMessage,
        string? transactionId = null,
        CancellationToken cancellationToken = default);
}
