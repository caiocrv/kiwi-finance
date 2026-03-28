namespace KiwiFinance.Core.Entities;

public class Parcelamento
{
    public Guid Id { get; set; }
    public Guid TransacaoId { get; set; }
    public int NumeroParcela { get; set; }
    public int TotalParcelas { get; set; }
    public decimal ValorParcela { get; set; }
    public DateTime DataVencimento { get; set; }
    public bool Pago { get; set; }
}