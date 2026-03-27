using KiwiFinance.Core.Entities;

namespace KiwiFinance.Core.Interfaces.Repositories;

public interface ITransacaoRepository
{
    Task AddAsync(Transacao transacao);
    Task<IEnumerable<Transacao>> GetAllByUsuarioAsync(Guid usuarioId);
}