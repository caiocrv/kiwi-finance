using System.Security.Claims;
using KiwiFinance.Core.DTOs;
using KiwiFinance.Core.Entities;
using KiwiFinance.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KiwiFinance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly IAuthService _authService;

    public UsuarioController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new { mensagem = "Nome, e-mail e senha sao obrigatorios." });
        }

        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = request.Email.Trim(),
            Telefone = request.Telefone.Trim(),
            Cpf = request.Cpf.Trim()
        };

        try
        {
            var novoUsuario = await _authService.RegistrarAsync(usuario, request.Senha);
            return Ok(new { mensagem = "Usuario cadastrado com sucesso!" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request);

        if (token == null)
            return Unauthorized(new { mensagem = "E-mail ou senha invalidos." });

        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("sessao")]
    public IActionResult ValidarSessao()
    {
        return NoContent();
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("kiwi_finance_auth");
        return Ok(new { mensagem = "Sessao encerrada com sucesso." });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var nome = User.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrWhiteSpace(nome))
            return Unauthorized(new { mensagem = "Token de autenticacao sem dados do usuario." });

        var response = new UsuarioAutenticadoResponse
        {
            Nome = nome
        };

        return Ok(response);
    }
}
