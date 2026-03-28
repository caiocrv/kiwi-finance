using KiwiFinance.Core.Entities;

namespace KiwiFinance.Core.Interfaces.Services;

public interface ITransacaoService
{
    Task RegistrarTransacaoAsync(Transacao transacao);
    Task<IEnumerable<Transacao>> ListarPorUsuarioAsync(Guid usuarioId);
    Task<ResumoFinanceiro> ObterResumoFinanceiroAsync(Guid usuarioId);
}