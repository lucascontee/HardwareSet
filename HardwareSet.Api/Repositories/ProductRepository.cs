using HardwareSet.Api.Data;
using HardwareSet.Api.Entities;
using MongoDB.Driver;

namespace HardwareSet.Api.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _products;

    public ProductRepository(MongoDbContext context)
    {
        _products = context.Products;
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _products
            .Find(_ => true)
            .SortByDescending(p => p.PurchaseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await _products
            .Find(p => p.Category.ToLower() == category.ToLower())
            .ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _products
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _products.InsertOneAsync(product, cancellationToken: cancellationToken);
    }

    public async Task<bool> UpdateAsync(string id, Product product, CancellationToken cancellationToken = default)
    {
        product.Id = id;
        var result = await _products.ReplaceOneAsync(
            p => p.Id == id,
            product,
            cancellationToken: cancellationToken);

        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _products.DeleteOneAsync(p => p.Id == id, cancellationToken);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }
}
