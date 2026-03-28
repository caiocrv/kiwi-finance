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
}