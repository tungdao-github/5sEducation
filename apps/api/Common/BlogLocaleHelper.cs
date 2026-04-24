namespace UdemyClone.Api.Common;

public static class BlogLocaleHelper
{
    public static string NormalizeLocale(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return "en";
        }

        return input.Trim().ToLowerInvariant().StartsWith("vi") ? "vi" : "en";
    }
}
