using Microsoft.AspNetCore.Mvc;
using KiwiFinance.Core.Entities;
using KiwiFinance.Core.DTOs;
using KiwiFinance.Core.Interfaces.Services;

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
    public async Task<IActionResult> Registrar([FromBody] Usuario usuario, [FromQuery] string senha)
    {
        var novoUsuario = await _authService.RegistrarAsync(usuario, senha);
        return Ok(new { mensagem = "Usuário cadastrado com sucesso!", id = novoUsuario.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request);

        if (token == null)
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        return Ok(new { token });
    }
}