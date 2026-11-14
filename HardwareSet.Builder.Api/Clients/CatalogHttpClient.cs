using System.Net;
using System.Net.Http.Json;
using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Clients;

public class CatalogHttpClient : ICatalogClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CatalogHttpClient> _logger;

    public CatalogHttpClient(HttpClient httpClient, ILogger<CatalogHttpClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<BuildComponent?> GetProductByIdAsync(string productId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/products/{Uri.EscapeDataString(productId)}", cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();
            var dto = await response.Content.ReadFromJsonAsync<CatalogProductDto>(cancellationToken: cancellationToken);
            if (dto is null)
            {
                return null;
            }

            return new BuildComponent
            {
                ProductId = dto.Id,
                Name = dto.Name,
                Category = HardwareCategory.Normalize(dto.Category),
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                Attributes = dto.Attributes is not null
                    ? new Dictionary<string, string>(dto.Attributes, StringComparer.OrdinalIgnoreCase)
                    : new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao consultar produto {ProductId} no Catalog.Api.", productId);
            return null;
        }
    }

    private sealed class CatalogProductDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public Dictionary<string, string>? Attributes { get; set; }
    }
}
