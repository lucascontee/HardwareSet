namespace HardwareSet.Builder.Api.Models;

public static class HardwareCategory
{
    public const string Cpu = "cpu";
    public const string Motherboard = "motherboard";
    public const string Gpu = "gpu";
    public const string Ram = "ram";
    public const string Ssd = "ssd";
    public const string Psu = "psu";

    public static readonly IReadOnlyList<string> RequiredCategories =
    [
        Cpu,
        Motherboard,
        Gpu,
        Ram,
        Ssd,
        Psu
    ];

    private static readonly Dictionary<string, string> CategoryLabels = new(StringComparer.OrdinalIgnoreCase)
    {
        [Cpu] = "Processador (CPU)",
        [Motherboard] = "Placa-Mãe",
        [Gpu] = "Placa de Vídeo (GPU)",
        [Ram] = "Memória RAM",
        [Ssd] = "Armazenamento (SSD)",
        [Psu] = "Fonte de Alimentação (PSU)"
    };

    public static string Normalize(string? category) =>
        (category ?? string.Empty).Trim().ToLowerInvariant();

    public static bool IsValid(string? category) =>
        !string.IsNullOrWhiteSpace(category) && CategoryLabels.ContainsKey(category.Trim());

    public static string GetDisplayName(string category) =>
        CategoryLabels.TryGetValue(category, out var label) ? label : category;
}
