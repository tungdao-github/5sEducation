using Microsoft.AspNetCore.Mvc;
using UdemyClone.Api.Dtos;
using UdemyClone.Api.Services;

namespace UdemyClone.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly PublicContentService _content;

    public SearchController(PublicContentService content)
    {
        _content = content;
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<List<SearchSuggestionDto>>> GetSuggestions([FromQuery] string? query)
    {
        return Ok(await _content.GetSearchSuggestionsAsync(query));
    }
}
