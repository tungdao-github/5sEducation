using UdemyClone.Api.Models;
using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Common;

public static class CoursePriceHelper
{
    public static bool IsFlashSaleActive(
        decimal price,
        decimal? flashSalePrice,
        DateTime? flashSaleStartsAt,
        DateTime? flashSaleEndsAt,
        DateTime now)
    {
        if (!flashSalePrice.HasValue || flashSalePrice.Value <= 0 || flashSalePrice.Value >= price)
        {
            return false;
        }

        if (flashSaleStartsAt.HasValue && now < flashSaleStartsAt.Value)
        {
            return false;
        }

        if (flashSaleEndsAt.HasValue && now > flashSaleEndsAt.Value)
        {
            return false;
        }

        return true;
    }

    public static bool IsFlashSaleActive(CourseSummaryProjection course, DateTime now)
    {
        return IsFlashSaleActive(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now);
    }

    public static bool IsFlashSaleActive(Course course, DateTime now)
    {
        return IsFlashSaleActive(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now);
    }

    public static decimal GetEffectivePrice(
        decimal price,
        decimal? flashSalePrice,
        DateTime? flashSaleStartsAt,
        DateTime? flashSaleEndsAt,
        DateTime now)
    {
        return IsFlashSaleActive(price, flashSalePrice, flashSaleStartsAt, flashSaleEndsAt, now)
            ? flashSalePrice ?? price
            : price;
    }

    public static decimal GetEffectivePrice(CourseSummaryProjection course, DateTime now)
    {
        return GetEffectivePrice(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now);
    }

    public static decimal GetEffectivePrice(Course course, DateTime now)
    {
        return GetEffectivePrice(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now);
    }

    public static decimal? GetOriginalPrice(
        decimal price,
        decimal? flashSalePrice,
        DateTime? flashSaleStartsAt,
        DateTime? flashSaleEndsAt,
        DateTime now)
    {
        return IsFlashSaleActive(price, flashSalePrice, flashSaleStartsAt, flashSaleEndsAt, now) ? price : null;
    }

    public static decimal? GetOriginalPrice(CourseSummaryProjection course, DateTime now)
    {
        return GetOriginalPrice(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now);
    }

    public static decimal? GetOriginalPrice(Course course, DateTime now)
    {
        return GetOriginalPrice(course.Price, course.FlashSalePrice, course.FlashSaleStartsAt, course.FlashSaleEndsAt, now);
    }

    public static decimal? NormalizeFlashSalePrice(decimal price, decimal? flashSalePrice)
    {
        if (!flashSalePrice.HasValue)
        {
            return null;
        }

        var value = flashSalePrice.Value;
        return value <= 0 || value >= price ? null : value;
    }

    public static (DateTime? start, DateTime? end) NormalizeFlashSaleWindow(DateTime? start, DateTime? end)
    {
        if (start.HasValue && end.HasValue && start.Value > end.Value)
        {
            return (null, null);
        }

        return (start, end);
    }
}
