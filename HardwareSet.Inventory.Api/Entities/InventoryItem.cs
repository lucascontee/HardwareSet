namespace HardwareSet.Inventory.Api.Entities;

public class InventoryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// ID do produto no Catalog.Api (ObjectId do MongoDB).
    /// </summary>
    public string ProductId { get; set; } = string.Empty;

    public string ProductName { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public int AvailableQuantity { get; set; }

    public int ReservedQuantity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Token de concorrência otimista nativo do PostgreSQL (xmin) para evitar race conditions em reservas simultâneas.
    /// </summary>
    public uint Version { get; set; }
}
