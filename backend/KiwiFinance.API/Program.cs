using Microsoft.EntityFrameworkCore;
using KiwiFinance.Infrastructure.Data;
using KiwiFinance.Core.Interfaces.Repositories;
using KiwiFinance.Infrastructure.Repositories;
using KiwiFinance.Core.Interfaces.Services;
using KiwiFinance.Services.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar a conexão com o PostgreSQL do Supabase
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KiwiFinanceContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Registrar as Injeções de Dependência (Camadas)
builder.Services.AddScoped<ITransacaoRepository, TransacaoRepository>();
builder.Services.AddScoped<ITransacaoService, TransacaoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. Configurar o Swagger para Testes
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
app.MapControllers();

app.Run();