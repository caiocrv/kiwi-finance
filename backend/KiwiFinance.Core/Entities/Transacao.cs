namespace KiwiFinance.Core.Entities;

public class Transacao
{
    public Guid Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public DateTime DataTransacao { get; set; }
    public string Tipo { get; set; } = string.Empty; // "Receita" ou "Despesa"
    public int CategoriaId { get; set; }
    public Guid UsuarioId { get; set; }
}