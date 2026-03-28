namespace KiwiFinance.Core.Entities;

public class ResumoFinanceiro
{
    public decimal TotalReceitas { get; set; }
    public decimal TotalDespesas { get; set; }

    // O Saldo é calculado automaticamente
    public decimal SaldoTotal => TotalReceitas - TotalDespesas;
}