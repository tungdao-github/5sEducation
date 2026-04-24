using System.Text.Json;
using UdemyClone.Api.Tests.TestInfrastructure;
using Xunit;

namespace UdemyClone.Api.Tests;

public class ApiSmokeTests : IClassFixture<ApiTestFactory>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ApiSmokeTests(ApiTestFactory factory)
    {
        _client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = true
        });
    }

    [Theory]
    [InlineData("/health")]
    [InlineData("/ready")]
    public async Task HealthEndpoints_ReturnSuccess(string path)
    {
        var response = await _client.GetAsync(path);

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Categories_ReturnSeededCategories()
    {
        var categories = await GetJsonAsync<List<CategorySmokeDto>>("/api/categories");

        Assert.NotEmpty(categories);
        Assert.All(categories, category =>
        {
            Assert.False(string.IsNullOrWhiteSpace(category.Title));
            Assert.False(string.IsNullOrWhiteSpace(category.Slug));
        });
    }

    [Fact]
    public async Task Courses_ReturnPublishedSeededCourses()
    {
        var courses = await GetJsonAsync<List<CourseSmokeDto>>("/api/courses?take=6");

        Assert.NotEmpty(courses);
        Assert.All(courses, course =>
        {
            Assert.False(string.IsNullOrWhiteSpace(course.Title));
            Assert.False(string.IsNullOrWhiteSpace(course.Slug));
            Assert.True(course.Price >= 0);
        });
    }

    [Fact]
    public async Task CourseDetail_ReturnsMatchingCourse()
    {
        var courses = await GetJsonAsync<List<CourseSmokeDto>>("/api/courses");
        Assert.NotEmpty(courses);
        var course = courses[0];

        var detail = await GetJsonAsync<CourseDetailSmokeDto>($"/api/courses/{course.Slug}");

        Assert.Equal(course.Slug, detail.Slug);
        Assert.Equal(course.Title, detail.Title);
        Assert.NotNull(detail.Lessons);
        Assert.NotEmpty(detail.Lessons);
    }

    [Fact]
    public async Task BlogPosts_ReturnPublishedSeededPosts()
    {
        var posts = await GetJsonAsync<List<BlogPostSmokeDto>>("/api/blog/posts?take=5");

        Assert.NotEmpty(posts);
        Assert.All(posts, post =>
        {
            Assert.False(string.IsNullOrWhiteSpace(post.Title));
            Assert.False(string.IsNullOrWhiteSpace(post.Slug));
        });
    }

    [Fact]
    public async Task BlogPostDetail_ReturnsMatchingPost()
    {
        var posts = await GetJsonAsync<List<BlogPostSmokeDto>>("/api/blog/posts?take=1");
        var post = Assert.Single(posts);

        var detail = await GetJsonAsync<BlogPostDetailSmokeDto>($"/api/blog/posts/{post.Slug}");

        Assert.Equal(post.Slug, detail.Slug);
        Assert.Equal(post.Title, detail.Title);
        Assert.False(string.IsNullOrWhiteSpace(detail.Content));
    }

    [Fact]
    public async Task PublicStats_ReturnPositiveTotals()
    {
        var stats = await GetJsonAsync<PublicStatsSmokeDto>("/api/stats/summary");

        Assert.True(stats.TotalCourses > 0);
        Assert.True(stats.TotalReviews >= 0);
        Assert.True(stats.TotalStudents >= 0);
        Assert.True(stats.TotalInstructors >= 0);
    }

    private async Task<T> GetJsonAsync<T>(string path)
    {
        var response = await _client.GetAsync(path);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadAsStringAsync();
        var value = JsonSerializer.Deserialize<T>(payload, JsonOptions);

        Assert.NotNull(value);
        return value;
    }

    private sealed class CategorySmokeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
    }

    private sealed class CourseSmokeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    private sealed class CourseDetailSmokeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public List<LessonSmokeDto> Lessons { get; set; } = [];
    }

    private sealed class LessonSmokeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
    }

    private sealed class BlogPostSmokeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
    }

    private sealed class BlogPostDetailSmokeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    private sealed class PublicStatsSmokeDto
    {
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalInstructors { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
    }
}
