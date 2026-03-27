using Microsoft.EntityFrameworkCore;
using KiwiFinance.Core.Entities;

namespace KiwiFinance.Infrastructure.Data;

public class KiwiFinanceContext : DbContext
{
    public KiwiFinanceContext(DbContextOptions<KiwiFinanceContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Transacao> Transacoes { get; set; }
    public DbSet<Categoria> Categorias { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Mapeia os nomes das tabelas para bater com o SQL que rodamos
        modelBuilder.Entity<Usuario>().ToTable("Usuario");
        modelBuilder.Entity<Transacao>().ToTable("Transacao");
        modelBuilder.Entity<Categoria>().ToTable("Categoria");
    }
}