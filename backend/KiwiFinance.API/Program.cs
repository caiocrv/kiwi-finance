using Microsoft.EntityFrameworkCore;
using KiwiFinance.Infrastructure.Data;
using KiwiFinance.Core.Interfaces.Repositories;
using KiwiFinance.Infrastructure.Repositories;
using KiwiFinance.Core.Interfaces.Services;
using KiwiFinance.Services.Services;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// 1. Carrega as variáveis do arquivo .env para a memória da máquina
Env.TraversePath().Load();

// 2. Tenta pegar a string de conexão do .env. Se não achar, lança um erro para avisar o desenvolvedor.
var connectionString = Environment.GetEnvironmentVariable("SUPABASE_CONNECTION");
if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("String de conexão não encontrada! Verifique se o arquivo .env existe e contém a chave SUPABASE_CONNECTION.");
}

// 3. Configura a conexão com o PostgreSQL do Supabase
builder.Services.AddDbContext<KiwiFinanceContext>(options =>
    options.UseNpgsql(connectionString));

// 4. Injeção de Dependências (Camadas Core, Infrastructure e Services)
builder.Services.AddScoped<ITransacaoRepository, TransacaoRepository>();
builder.Services.AddScoped<ITransacaoService, TransacaoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5. Ativa o Swagger para todos os ambientes (para facilitar os testes do PIM III)
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
app.MapControllers();

app.Run();