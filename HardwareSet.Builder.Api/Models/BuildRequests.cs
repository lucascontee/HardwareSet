namespace HardwareSet.Builder.Api.Models;

public class CreateBuildRequest
{
    public string? Name { get; set; }
    public List<BuildComponent>? InitialComponents { get; set; }
}

public class SelectComponentRequest
{
    /// <summary>
    /// ID do produto no Catalog.Api (opcional caso os dados da peça sejam enviados diretamente no corpo).
    /// </summary>
    public string? ProductId { get; set; }

    public string? Name { get; set; }
    public decimal? Price { get; set; }
    public string? ImageUrl { get; set; }
    public Dictionary<string, string>? Attributes { get; set; }
}

public class ValidateBuildRequest
{
    public List<BuildComponent> Components { get; set; } = [];
}

public class ValidateBuildResponse
{
    public decimal TotalPrice { get; set; }
    public int SelectedComponentsCount { get; set; }
    public CompatibilityReport Compatibility { get; set; } = new();
}
