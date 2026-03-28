using KiwiFinance.Core.Entities;
using KiwiFinance.Core.Interfaces.Repositories;
using KiwiFinance.Core.Interfaces.Services;

namespace KiwiFinance.Services.Services;

public class TransacaoService : ITransacaoService
{
    private readonly ITransacaoRepository _repository;

    public TransacaoService(ITransacaoRepository repository)
    {
        _repository = repository;
    }

    public async Task RegistrarTransacaoAsync(Transacao transacao)
    {
        await _repository.AddAsync(transacao);
    }

    public async Task<IEnumerable<Transacao>> ListarPorUsuarioAsync(Guid usuarioId)
    {
        return await _repository.GetAllByUsuarioAsync(usuarioId);
    }

    public async Task<ResumoFinanceiro> ObterResumoFinanceiroAsync(Guid usuarioId)
    {
        // 1. Busca todas as transações daquele usuário no banco
        var transacoes = await _repository.GetAllByUsuarioAsync(usuarioId);

        // 2. Faz a matemática separando por tipo
        var resumo = new ResumoFinanceiro
        {
            TotalReceitas = transacoes.Where(t => t.Tipo == "Receita").Sum(t => t.Valor),
            TotalDespesas = transacoes.Where(t => t.Tipo == "Despesa").Sum(t => t.Valor)
        };

        // O SaldoTotal já será calculado automaticamente pela classe ResumoFinanceiro
        return resumo;
    }
}