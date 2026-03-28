namespace KiwiFinance.Core.Entities;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty; // "Receita" ou "Despesa"
}