using KiwiFinance.Core.Entities;
using KiwiFinance.Core.Interfaces.Repositories;
using KiwiFinance.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KiwiFinance.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly KiwiFinanceContext _context;

    public UsuarioRepository(KiwiFinanceContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Usuario usuario)
    {
        await _context.Usuarios.AddAsync(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<Usuario?> GetByIdAsync(Guid id)
    {
        return await _context.Usuarios.FindAsync(id);
    }
}