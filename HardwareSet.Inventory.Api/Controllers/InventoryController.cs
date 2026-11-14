using HardwareSet.Inventory.Api.Entities;
using HardwareSet.Inventory.Api.Models;
using HardwareSet.Inventory.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HardwareSet.Inventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _inventoryService.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{productId}")]
    public async Task<ActionResult<InventoryItem>> GetByProductId(
        string productId,
        CancellationToken cancellationToken)
    {
        var item = await _inventoryService.GetByProductIdAsync(productId, cancellationToken);
        if (item is null)
        {
            return NotFound($"Registro de estoque para o produto '{productId}' não encontrado.");
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItem>> InitializeStock(
        [FromBody] CreateInventoryItemRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ProductId) || string.IsNullOrWhiteSpace(request.ProductName))
        {
            return BadRequest("Os campos 'productId' e 'productName' são obrigatórios.");
        }

        var created = await _inventoryService.InitializeProductStockAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByProductId), new { productId = created.ProductId }, created);
    }

    [HttpPatch("{productId}/stock")]
    public async Task<ActionResult<InventoryItem>> AdjustStock(
        string productId,
        [FromBody] AdjustStockRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _inventoryService.AdjustStockAsync(productId, request.QuantityDelta, cancellationToken);
            if (updated is null)
            {
                return NotFound($"Registro de estoque para o produto '{productId}' não encontrado.");
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("reserve")]
    public async Task<ActionResult<ReserveBatchResponse>> ReserveBatch(
        [FromBody] ReserveBatchRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Items is null || request.Items.Count == 0)
        {
            return BadRequest("Informe ao menos um item para reserva de estoque.");
        }

        var result = await _inventoryService.ReserveBatchAsync(request.Items, cancellationToken);
        if (!result.Success)
        {
            return Conflict(result);
        }

        return Ok(result);
    }
}
