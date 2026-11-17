namespace HardwareSet.Contracts.Events;

/// <summary>
/// Evento de integração publicado pelo Catalog.Api quando uma nova peça é cadastrada
/// e consumido pelo Inventory.Api para inicializar o registro de estoque no PostgreSQL.
/// </summary>
public record ProductCreatedEvent
{
    public string ProductId { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public int InitialQuantity { get; init; } = 10;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
