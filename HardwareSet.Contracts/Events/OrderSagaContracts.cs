namespace HardwareSet.Contracts.Events;

public record OrderLineItemContract
{
    public string ProductId { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public int Quantity { get; init; } = 1;
}

public record OrderSubmittedEvent
{
    public Guid OrderId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = "pix";
    public bool SimulatePaymentFailure { get; init; }
    public decimal TotalAmount { get; init; }
    public List<OrderLineItemContract> Items { get; init; } = [];
    public DateTime SubmittedAt { get; init; } = DateTime.UtcNow;
}

public record ReserveOrderStockCommand
{
    public Guid OrderId { get; init; }
    public List<OrderLineItemContract> Items { get; init; } = [];
}

public record OrderStockReservedEvent
{
    public Guid OrderId { get; init; }
    public DateTime ReservedAt { get; init; } = DateTime.UtcNow;
}

public record OrderStockReservationFailedEvent
{
    public Guid OrderId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public List<string> UnavailableProductIds { get; init; } = [];
    public DateTime FailedAt { get; init; } = DateTime.UtcNow;
}

public record ProcessOrderPaymentCommand
{
    public Guid OrderId { get; init; }
    public decimal Amount { get; init; }
    public string PaymentMethod { get; init; } = "pix";
    public bool SimulatePaymentFailure { get; init; }
}

public record OrderPaymentApprovedEvent
{
    public Guid OrderId { get; init; }
    public string TransactionId { get; init; } = string.Empty;
    public DateTime ApprovedAt { get; init; } = DateTime.UtcNow;
}

public record OrderPaymentFailedEvent
{
    public Guid OrderId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public DateTime FailedAt { get; init; } = DateTime.UtcNow;
}

/// <summary>
/// Comando de Transação Compensatória (Rollback distribuído):
/// Disparado pela Saga quando o pagamento é recusado após o estoque já ter sido reservado.
/// </summary>
public record ReleaseOrderStockCommand
{
    public Guid OrderId { get; init; }
    public List<OrderLineItemContract> Items { get; init; } = [];
    public string Reason { get; init; } = string.Empty;
}
