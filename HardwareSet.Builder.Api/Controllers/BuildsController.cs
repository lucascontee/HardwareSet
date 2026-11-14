using HardwareSet.Builder.Api.Models;
using HardwareSet.Builder.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HardwareSet.Builder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuildsController : ControllerBase
{
    private readonly IBuilderService _builderService;

    public BuildsController(IBuilderService builderService)
    {
        _builderService = builderService;
    }

    /// <summary>
    /// Valida de forma stateless a compatibilidade e consumo energético de uma lista de componentes.
    /// </summary>
    [HttpPost("validate")]
    public ActionResult<ValidateBuildResponse> Validate([FromBody] ValidateBuildRequest request)
    {
        var response = _builderService.ValidateStandalone(request.Components ?? []);
        return Ok(response);
    }

    /// <summary>
    /// Cria uma nova sessão de montagem de PC e calcula seu relatório inicial de compatibilidade.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BuildSession>> Create(
        [FromBody] CreateBuildRequest? request,
        CancellationToken cancellationToken)
    {
        var session = await _builderService.CreateSessionAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = session.Id }, session);
    }

    /// <summary>
    /// Obtém uma sessão de montagem pelo ID com todas as peças, preço total e relatório de compatibilidade.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BuildSession>> GetById(string id, CancellationToken cancellationToken)
    {
        var session = await _builderService.GetSessionByIdAsync(id, cancellationToken);
        if (session is null)
        {
            return NotFound($"Sessão de montagem '{id}' não encontrada.");
        }

        return Ok(session);
    }

    /// <summary>
    /// Seleciona ou substitui uma peça em um slot específico (cpu, motherboard, gpu, ram, ssd, psu) e revalida o setup.
    /// </summary>
    [HttpPut("{id}/components/{category}")]
    public async Task<ActionResult<BuildSession>> SelectComponent(
        string id,
        string category,
        [FromBody] SelectComponentRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _builderService.SelectComponentAsync(id, category, request, cancellationToken);
            if (updated is null)
            {
                return NotFound($"Sessão de montagem '{id}' não encontrada.");
            }

            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Remove uma peça de um slot específico e reavalia a compatibilidade do setup.
    /// </summary>
    [HttpDelete("{id}/components/{category}")]
    public async Task<ActionResult<BuildSession>> RemoveComponent(
        string id,
        string category,
        CancellationToken cancellationToken)
    {
        var updated = await _builderService.RemoveComponentAsync(id, category, cancellationToken);
        if (updated is null)
        {
            return NotFound($"Sessão de montagem '{id}' não encontrada.");
        }

        return Ok(updated);
    }

    /// <summary>
    /// Exclui uma sessão de montagem.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var deleted = await _builderService.DeleteSessionAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound($"Sessão de montagem '{id}' não encontrada.");
        }

        return NoContent();
    }
}
