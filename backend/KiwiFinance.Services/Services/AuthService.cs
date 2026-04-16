using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KiwiFinance.Core.Entities;
using KiwiFinance.Core.DTOs;
using KiwiFinance.Core.Interfaces.Services;
using KiwiFinance.Core.Interfaces.Repositories;

namespace KiwiFinance.Services.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public AuthService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<Usuario> RegistrarAsync(Usuario usuario, string senha)
    {
        var usuarioExistente = await _usuarioRepository.GetByEmailAsync(usuario.Email);

        if (usuarioExistente != null)
            throw new InvalidOperationException("Ja existe um usuario cadastrado com este e-mail.");

        // Criptografa a senha antes de salvar
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(senha);

        await _usuarioRepository.AddAsync(usuario);
        return usuario;
    }

    public async Task<string?> LoginAsync(LoginRequest login)
    {
        // 1. Busca usuário pelo e-mail
        var usuario = await _usuarioRepository.GetByEmailAsync(login.Email);

        if (usuario == null) return null;

        // 2. Verifica se a senha digitada bate com o Hash do banco
        bool senhaValida = BCrypt.Net.BCrypt.Verify(login.Senha, usuario.SenhaHash);

        if (!senhaValida) return null;

        // 3. Se tudo OK, gera o Token JWT
        return GerarTokenJwt(usuario);
    }

    private string GerarTokenJwt(Usuario usuario)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome)
            }),
            Expires = DateTime.UtcNow.AddHours(8), // Token vale por 8 horas
            Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
            Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
