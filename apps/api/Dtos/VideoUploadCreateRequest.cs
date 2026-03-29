using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Api.Dtos;

public class VideoUploadCreateRequest
{
    [Required, Range(1, int.MaxValue)]
    public int CourseId { get; set; }

    [Range(60, 14400)]
    public int? MaxDurationSeconds { get; set; }
}
