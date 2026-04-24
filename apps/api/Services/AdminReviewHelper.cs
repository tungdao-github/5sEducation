using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class AdminReviewHelper
{
    public static AdminReviewDto MapReview(Review review)
    {
        return new AdminReviewDto
        {
            Id = review.Id,
            CourseId = review.CourseId,
            CourseTitle = review.Course != null ? review.Course.Title : string.Empty,
            Rating = review.Rating,
            Comment = review.Comment,
            UserId = review.UserId,
            UserEmail = review.User != null ? (review.User.Email ?? string.Empty) : string.Empty,
            UserName = review.User != null ? $"{review.User.FirstName} {review.User.LastName}".Trim() : string.Empty,
            CreatedAt = review.CreatedAt
        };
    }
}
