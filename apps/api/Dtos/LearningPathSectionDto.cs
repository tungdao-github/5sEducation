namespace UdemyClone.Api.Dtos;

public class LearningPathSectionDto
{
    public int Id { get; set; }

    public int LearningPathId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
