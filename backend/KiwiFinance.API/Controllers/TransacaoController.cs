using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using KiwiFinance.Core.Entities;
using KiwiFinance.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;

namespace KiwiFinance.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    private readonly ITransacaoService _transacaoService;

    public TransacaoController(ITransacaoService transacaoService)
    {
        _transacaoService = transacaoService;
    }

    private Guid ObterUsuarioId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(claim!);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] Transacao transacao)
    {
        transacao.UsuarioId = ObterUsuarioId();
        await _transacaoService.RegistrarTransacaoAsync(transacao);
        return Ok(new { mensagem = "Transação salva com sucesso no Supabase!" });
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarioId = ObterUsuarioId();
        var transacoes = await _transacaoService.ListarPorUsuarioAsync(usuarioId);
        return Ok(transacoes);
    }

    [HttpGet("resumo")]
    public async Task<IActionResult> ObterResumo()
    {
        var usuarioId = ObterUsuarioId();
        var resumo = await _transacaoService.ObterResumoFinanceiroAsync(usuarioId);
        return Ok(resumo);
    }
}