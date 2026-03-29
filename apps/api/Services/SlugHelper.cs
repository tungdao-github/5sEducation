using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace UdemyClone.Api.Services;

public static class SlugHelper
{
    public static string Slugify(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var normalized = input.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var ch in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(ch);
            }
        }

        var lower = builder.ToString().Normalize(NormalizationForm.FormC).Trim().ToLowerInvariant();
        lower = Regex.Replace(lower, @"[^a-z0-9\s-]", "");
        lower = Regex.Replace(lower, @"\s+", " ").Trim();
        lower = lower.Replace(" ", "-");
        lower = Regex.Replace(lower, @"-+", "-");
        return lower;
    }
}
