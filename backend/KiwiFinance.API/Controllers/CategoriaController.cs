using Microsoft.AspNetCore.Mvc;
using KiwiFinance.Core.Entities;
using KiwiFinance.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace KiwiFinance.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriaController : ControllerBase
{
    private readonly KiwiFinanceContext _context;

    public CategoriaController(KiwiFinanceContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var categorias = await _context.Categorias
            .AsNoTracking()
            .ToListAsync();
        return Ok(categorias);
    }
}
