using HardwareSet.Order.Api.Models;
using HardwareSet.Order.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HardwareSet.Order.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Entities.Order>>> GetAll(CancellationToken cancellationToken)
    {
        var orders = await _orderService.GetAllAsync(cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Entities.Order>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetByIdAsync(id, cancellationToken);
        if (order is null)
        {
            return NotFound($"Pedido '{id}' não encontrado.");
        }

        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<Entities.Order>> Create(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Items is null || request.Items.Count == 0)
        {
            return BadRequest("O pedido precisa conter ao menos um componente selecionado.");
        }

        var order = await _orderService.CreateOrderAndStartSagaAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }
}
