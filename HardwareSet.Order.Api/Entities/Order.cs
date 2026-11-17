using System.Text.Json.Serialization;

namespace HardwareSet.Order.Api.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderStatus
{
    Pending,
    ReservingStock,
    ProcessingPayment,
    Confirmed,
    FailedOutOfStock,
    FailedPaymentCompensated
}

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CustomerName { get; set; } = "Cliente HardwareSet";
    public string PaymentMethod { get; set; } = "pix";
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string StatusMessage { get; set; } = "Pedido recebido. Iniciando reserva de componentes...";
    public string? TransactionId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = [];
}

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; } = 1;
}
