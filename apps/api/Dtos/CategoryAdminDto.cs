namespace UdemyClone.Api.Dtos;

public class CategoryAdminDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public int CourseCount { get; set; }
}
