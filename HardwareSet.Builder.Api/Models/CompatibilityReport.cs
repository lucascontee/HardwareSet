using System.Text.Json.Serialization;

namespace HardwareSet.Builder.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CompatibilitySeverity
{
    Info,
    Warning,
    Error
}

public class CompatibilityIssue
{
    public string Code { get; set; } = string.Empty;
    public CompatibilitySeverity Severity { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> AffectedCategories { get; set; } = [];
}

public class CompatibilityReport
{
    /// <summary>
    /// True quando não há nenhuma incompatibilidade impeditiva (Severity == Error).
    /// </summary>
    public bool IsCompatible { get; set; } = true;

    /// <summary>
    /// True quando todos os 6 componentes essenciais foram selecionados.
    /// </summary>
    public bool IsComplete { get; set; }

    /// <summary>
    /// Consumo energético estimado do sistema (CPU + GPU + base da plataforma) em Watts.
    /// </summary>
    public int EstimatedTdpWatts { get; set; }

    /// <summary>
    /// Potência mínima recomendada para a fonte considerando margem de segurança de 25%.
    /// </summary>
    public int RecommendedPsuWatts { get; set; }

    /// <summary>
    /// Potência nominal identificada na fonte selecionada (quando presente).
    /// </summary>
    public int? ProvidedPsuWatts { get; set; }

    /// <summary>
    /// Lista de alertas, recomendações e erros de compatibilidade encontrados.
    /// </summary>
    public List<CompatibilityIssue> Issues { get; set; } = [];
}
