using KiwiFinance.Core.Entities;
using KiwiFinance.Core.DTOs;

namespace KiwiFinance.Core.Interfaces.Services; // Verifique se este caminho está correto

public interface IAuthService
{
    Task<Usuario> RegistrarAsync(Usuario usuario, string senha);
    Task<string?> LoginAsync(LoginRequest login);
}
