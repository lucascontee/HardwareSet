using HardwareSet.Order.Api.Models;

namespace HardwareSet.Order.Api.Services;

public interface IOrderService
{
    Task<IEnumerable<Entities.Order>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Entities.Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Entities.Order> CreateOrderAndStartSagaAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
}
