using KiwiFinance.Core.Entities;
using KiwiFinance.Core.Interfaces.Repositories;
using KiwiFinance.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace KiwiFinance.Infrastructure.Repositories;

public class TransacaoRepository : ITransacaoRepository
{
    private readonly KiwiFinanceContext _context;

    public TransacaoRepository(KiwiFinanceContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Transacao transacao)
    {
        await _context.Transacoes.AddAsync(transacao);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Transacao>> GetAllByUsuarioAsync(Guid usuarioId)
    {
        return await _context.Transacoes
            .AsNoTracking()
            .Where(t => t.UsuarioId == usuarioId)
            .ToListAsync();
    }
}