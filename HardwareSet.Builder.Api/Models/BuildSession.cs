namespace HardwareSet.Builder.Api.Models;

public class BuildSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "Configuração Personalizada";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Peças selecionadas indexadas pela categoria (cpu, motherboard, gpu, ram, ssd, psu).
    /// </summary>
    public Dictionary<string, BuildComponent> Components { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public decimal TotalPrice { get; set; }

    public CompatibilityReport Compatibility { get; set; } = new();
}
