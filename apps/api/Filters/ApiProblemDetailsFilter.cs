using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.WebUtilities;

namespace UdemyClone.Api.Filters;

public class ApiProblemDetailsFilter : IAsyncResultFilter
{
    private readonly ProblemDetailsFactory _problemDetailsFactory;

    public ApiProblemDetailsFilter(ProblemDetailsFactory problemDetailsFactory)
    {
        _problemDetailsFactory = problemDetailsFactory;
    }

    public Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (context.Result is ObjectResult objectResult)
        {
            var statusCode = objectResult.StatusCode ?? context.HttpContext.Response.StatusCode;
            if (objectResult.Value is ProblemDetails || objectResult.Value is ValidationProblemDetails)
            {
                return next();
            }

            if (objectResult.Value is string message)
            {
                var problemDetails = _problemDetailsFactory.CreateProblemDetails(
                    context.HttpContext,
                    statusCode: statusCode,
                    title: message,
                    type: $"https://httpstatuses.com/{statusCode}");
                context.Result = new ObjectResult(problemDetails) { StatusCode = problemDetails.Status };
                return next();
            }

            if (statusCode == StatusCodes.Status400BadRequest && objectResult.Value is IEnumerable<string> errors)
            {
                var modelState = new ModelStateDictionary();
                modelState.AddModelError("error", string.Join(" ", errors));
                var problemDetails = _problemDetailsFactory.CreateValidationProblemDetails(
                    context.HttpContext,
                    modelStateDictionary: modelState,
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Validation failed.",
                    type: "https://httpstatuses.com/400");
                context.Result = new ObjectResult(problemDetails) { StatusCode = problemDetails.Status };
                return next();
            }
        }

        if (context.Result is StatusCodeResult statusResult && statusResult.StatusCode >= 400)
        {
            var title = ReasonPhrases.GetReasonPhrase(statusResult.StatusCode);
            var problemDetails = _problemDetailsFactory.CreateProblemDetails(
                context.HttpContext,
                statusCode: statusResult.StatusCode,
                title: title,
                type: $"https://httpstatuses.com/{statusResult.StatusCode}");
            context.Result = new ObjectResult(problemDetails) { StatusCode = problemDetails.Status };
        }

        return next();
    }
}
