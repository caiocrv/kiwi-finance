using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using KiwiFinance.Infrastructure.Data;
using KiwiFinance.Core.Interfaces.Repositories;
using KiwiFinance.Infrastructure.Repositories;
using KiwiFinance.Core.Interfaces.Services;
using KiwiFinance.Services.Services;
using DotNetEnv;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Carrega as variáveis do .env
Env.TraversePath().Load();

var connectionString = Environment.GetEnvironmentVariable("SUPABASE_CONNECTION");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(jwtSecret))
{
    throw new Exception("Variáveis de ambiente (SUPABASE_CONNECTION ou JWT_SECRET) não encontradas no .env!");
}

// 2. Banco de Dados
builder.Services.AddDbContextPool<KiwiFinanceContext>(options =>
    options.UseNpgsql(connectionString));

// 3. Configuração de Autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

// 4. Injeção de Dependências
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>(); // Você precisará criar esta classe!
builder.Services.AddScoped<ITransacaoRepository, TransacaoRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITransacaoService, TransacaoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Adiciona o botão de "Authorize"
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT gerado no login."
    });

    // Diz ao Swagger para usar o token em todos os endpoints trancados
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


var app = builder.Build();

// 5. Middleware Pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();