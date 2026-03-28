using Microsoft.AspNetCore.Mvc;
using KiwiFinance.Core.Entities;
using KiwiFinance.Core.Interfaces.Services;

namespace KiwiFinance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    private readonly ITransacaoService _transacaoService;

    public TransacaoController(ITransacaoService transacaoService)
    {
        _transacaoService = transacaoService;
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] Transacao transacao)
    {
        await _transacaoService.RegistrarTransacaoAsync(transacao);
        return Ok(new { mensagem = "Transação salva com sucesso no Supabase!" });
    }

    [HttpGet("{usuarioId}")]
    public async Task<IActionResult> Listar(Guid usuarioId)
    {
        var transacoes = await _transacaoService.ListarPorUsuarioAsync(usuarioId);
        return Ok(transacoes);
    }

    [HttpGet("{usuarioId}/resumo")]
    public async Task<IActionResult> ObterResumo(Guid usuarioId)
    {
        var resumo = await _transacaoService.ObterResumoFinanceiroAsync(usuarioId);
        return Ok(resumo);
    }
}