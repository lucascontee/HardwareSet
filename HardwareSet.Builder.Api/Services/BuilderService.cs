using HardwareSet.Builder.Api.Clients;
using HardwareSet.Builder.Api.Models;
using HardwareSet.Builder.Api.Repositories;

namespace HardwareSet.Builder.Api.Services;

public class BuilderService : IBuilderService
{
    private readonly IBuildRepository _buildRepository;
    private readonly ICompatibilityService _compatibilityService;
    private readonly ICatalogClient _catalogClient;

    public BuilderService(
        IBuildRepository buildRepository,
        ICompatibilityService compatibilityService,
        ICatalogClient catalogClient)
    {
        _buildRepository = buildRepository;
        _compatibilityService = compatibilityService;
        _catalogClient = catalogClient;
    }

    public async Task<BuildSession> CreateSessionAsync(CreateBuildRequest? request, CancellationToken cancellationToken = default)
    {
        var session = new BuildSession
        {
            Name = string.IsNullOrWhiteSpace(request?.Name)
                ? "Configuração Personalizada"
                : request.Name.Trim()
        };

        if (request?.InitialComponents is { Count: > 0 })
        {
            foreach (var item in request.InitialComponents)
            {
                var normalizedCategory = HardwareCategory.Normalize(item.Category);
                if (!HardwareCategory.IsValid(normalizedCategory))
                {
                    continue;
                }

                item.Category = normalizedCategory;
                session.Components[normalizedCategory] = item;
            }
        }

        RecalculateSession(session);
        return await _buildRepository.SaveAsync(session, cancellationToken);
    }

    public Task<BuildSession?> GetSessionByIdAsync(string id, CancellationToken cancellationToken = default) =>
        _buildRepository.GetByIdAsync(id, cancellationToken);

    public async Task<BuildSession?> SelectComponentAsync(
        string buildId,
        string category,
        SelectComponentRequest request,
        CancellationToken cancellationToken = default)
    {
        var session = await _buildRepository.GetByIdAsync(buildId, cancellationToken);
        if (session is null)
        {
            return null;
        }

        var normalizedCategory = HardwareCategory.Normalize(category);
        if (!HardwareCategory.IsValid(normalizedCategory))
        {
            throw new ArgumentException($"Categoria '{category}' não é suportada pelo montador.");
        }

        BuildComponent? component = null;

        // Se o ProductId foi informado e o cliente não enviou o nome/atributos completos, busca no Catalog.Api
        if (!string.IsNullOrWhiteSpace(request.ProductId) && string.IsNullOrWhiteSpace(request.Name))
        {
            component = await _catalogClient.GetProductByIdAsync(request.ProductId, cancellationToken);
            if (component is null)
            {
                throw new KeyNotFoundException($"Produto '{request.ProductId}' não encontrado no serviço de catálogo.");
            }

            if (!string.IsNullOrWhiteSpace(component.Category) &&
                !string.Equals(component.Category, normalizedCategory, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"O produto '{component.Name}' pertence à categoria '{component.Category}' e não pode ser alocado no slot '{normalizedCategory}'.");
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                throw new ArgumentException("Informe o 'productId' ou o 'name' da peça para selecioná-la.");
            }

            component = new BuildComponent
            {
                ProductId = request.ProductId,
                Name = request.Name.Trim(),
                Category = normalizedCategory,
                Price = request.Price ?? 0m,
                ImageUrl = request.ImageUrl ?? string.Empty,
                Attributes = request.Attributes is not null
                    ? new Dictionary<string, string>(request.Attributes, StringComparer.OrdinalIgnoreCase)
                    : new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            };
        }

        component.Category = normalizedCategory;
        session.Components[normalizedCategory] = component;

        RecalculateSession(session);
        return await _buildRepository.SaveAsync(session, cancellationToken);
    }

    public async Task<BuildSession?> RemoveComponentAsync(
        string buildId,
        string category,
        CancellationToken cancellationToken = default)
    {
        var session = await _buildRepository.GetByIdAsync(buildId, cancellationToken);
        if (session is null)
        {
            return null;
        }

        var normalizedCategory = HardwareCategory.Normalize(category);
        session.Components.Remove(normalizedCategory);

        RecalculateSession(session);
        return await _buildRepository.SaveAsync(session, cancellationToken);
    }

    public Task<bool> DeleteSessionAsync(string id, CancellationToken cancellationToken = default) =>
        _buildRepository.DeleteAsync(id, cancellationToken);

    public ValidateBuildResponse ValidateStandalone(IEnumerable<BuildComponent> components)
    {
        var componentMap = new Dictionary<string, BuildComponent>(StringComparer.OrdinalIgnoreCase);

        foreach (var comp in components)
        {
            var normalizedCategory = HardwareCategory.Normalize(comp.Category);
            if (HardwareCategory.IsValid(normalizedCategory))
            {
                comp.Category = normalizedCategory;
                componentMap[normalizedCategory] = comp;
            }
        }

        var totalPrice = componentMap.Values.Sum(c => c.Price);
        var report = _compatibilityService.Evaluate(componentMap);

        return new ValidateBuildResponse
        {
            TotalPrice = totalPrice,
            SelectedComponentsCount = componentMap.Count,
            Compatibility = report
        };
    }

    private void RecalculateSession(BuildSession session)
    {
        session.TotalPrice = session.Components.Values.Sum(c => c.Price);
        session.Compatibility = _compatibilityService.Evaluate(session.Components);
    }
}
