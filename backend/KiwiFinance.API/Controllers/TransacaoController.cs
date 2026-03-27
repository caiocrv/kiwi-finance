using Microsoft.AspNetCore.Mvc;

namespace KiwiFinance.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    [HttpGet]
    public IActionResult Teste()
    {
        return Ok("Backend da Kiwi Finance está funcionando!");
    }
}