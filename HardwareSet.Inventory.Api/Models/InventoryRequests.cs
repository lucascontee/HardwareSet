namespace HardwareSet.Inventory.Api.Models;

public class CreateInventoryItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int InitialQuantity { get; set; } = 10;
}

public class AdjustStockRequest
{
    /// <summary>
    /// Quantidade a ser somada (positiva) ou subtraída (negativa) do estoque disponível.
    /// </summary>
    public int QuantityDelta { get; set; }
}

public class ReserveStockItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}

public class ReserveBatchRequest
{
    public List<ReserveStockItemDto> Items { get; set; } = [];
}

public class ReserveBatchResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> UnavailableProductIds { get; set; } = [];
}
