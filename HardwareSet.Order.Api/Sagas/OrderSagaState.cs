using HardwareSet.Contracts.Events;
using MassTransit;

namespace HardwareSet.Order.Api.Sagas;

public class OrderSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "pix";
    public bool SimulatePaymentFailure { get; set; }
    public List<OrderLineItemContract> Items { get; set; } = [];
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
