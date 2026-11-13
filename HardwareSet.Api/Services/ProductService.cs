using HardwareSet.Api.Entities;
using HardwareSet.Api.Repositories;

namespace HardwareSet.Api.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _repository.GetAllAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByCategoryAsync(category, cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        product.Id = null;
        if (product.PurchaseDate == default)
        {
            product.PurchaseDate = DateTime.UtcNow;
        }

        if (string.IsNullOrWhiteSpace(product.Category) &&
            product.Attributes.TryGetValue("category", out var attrCategory))
        {
            product.Category = attrCategory;
        }

        await _repository.CreateAsync(product, cancellationToken);
        return product;
    }

    public async Task<bool> UpdateAsync(string id, Product product, CancellationToken cancellationToken = default)
    {
        return await _repository.UpdateAsync(id, product, cancellationToken);
    }

    public async Task<bool> DeleteAsync(string id, Product product, CancellationToken cancellationToken = default)
    {
        return await _repository.DeleteAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _repository.DeleteAsync(id, cancellationToken);
    }
}
