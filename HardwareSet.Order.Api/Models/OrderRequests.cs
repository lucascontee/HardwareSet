namespace HardwareSet.Order.Api.Models;

public class CreateOrderItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; } = 1;
}

public class CreateOrderRequest
{
    public string? CustomerName { get; set; }
    public string PaymentMethod { get; set; } = "pix";
    public bool SimulatePaymentFailure { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = [];
}
