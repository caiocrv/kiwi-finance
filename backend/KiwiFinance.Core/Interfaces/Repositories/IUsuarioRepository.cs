using KiwiFinance.Core.Entities;

namespace KiwiFinance.Core.Interfaces.Repositories;

public interface IUsuarioRepository
{
    Task AddAsync(Usuario usuario);
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario?> GetByIdAsync(Guid id);
}