using HardwareSet.Api.Data;
using HardwareSet.Api.Entities;
using HardwareSet.Api.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace HardwareSet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly MongoDbContext _mongoContext;

    public ProductsController(IProductService productService, MongoDbContext mongoContext)
    {
        _productService = productService;
        _mongoContext = mongoContext;
    }

    [HttpPost("seed")]
    public async Task<ActionResult<IEnumerable<Product>>> Seed(
        [FromQuery] bool reset = false,
        CancellationToken cancellationToken = default)
    {
        await DatabaseSeeder.SeedAsync(_mongoContext, reset, cancellationToken);
        var products = await _productService.GetAllAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll(
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(category))
        {
            var filtered = await _productService.GetByCategoryAsync(category, cancellationToken);
            return Ok(filtered);
        }

        var products = await _productService.GetAllAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<Product>> GetById(string id, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return BadRequest("Formato de Id inválido.");
        }

        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(
        [FromBody] Product product,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(product.Name))
        {
            return BadRequest("O nome do produto é obrigatório.");
        }

        if (product.Price < 0)
        {
            return BadRequest("O valor do produto não pode ser negativo.");
        }

        var created = await _productService.CreateAsync(product, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] Product product,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return BadRequest("Formato de Id inválido.");
        }

        var existing = await _productService.GetByIdAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        await _productService.UpdateAsync(id, product, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return BadRequest("Formato de Id inválido.");
        }

        var deleted = await _productService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
