using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static partial class LessonExerciseHelper
{
    private const string VideoContentType = "video";
    private const string ExerciseContentType = "exercise";

    public static int NormalizePassingPercent(int passingPercent)
    {
        if (passingPercent < 1)
        {
            return 80;
        }

        return Math.Min(100, passingPercent);
    }

    public static int NormalizeTimeLimitSeconds(int timeLimitSeconds)
    {
        return Math.Clamp(timeLimitSeconds, 0, 7200);
    }

    public static int NormalizeMaxTabSwitches(int maxTabSwitches)
    {
        return Math.Clamp(maxTabSwitches, 0, 20);
    }

    public static LessonDto MapLesson(Lesson lesson)
    {
        var questions = GetConfiguredQuestions(lesson);
        var hasStructuredExercise = questions.Count > 0;
        var normalizedType = NormalizeContentTypeForResponse(lesson.ContentType, hasStructuredExercise);
        var hasExercise = normalizedType == ExerciseContentType && hasStructuredExercise;

        return new LessonDto
        {
            Id = lesson.Id,
            CourseId = lesson.CourseId,
            Title = lesson.Title,
            ContentType = normalizedType,
            DurationMinutes = lesson.DurationMinutes,
            VideoUrl = lesson.VideoUrl,
            SortOrder = lesson.SortOrder,
            HasExercise = hasExercise,
            Exercise = hasExercise
                ? new LessonExerciseDto
                {
                    PassingPercent = NormalizePassingPercent(lesson.ExercisePassingPercent),
                    TimeLimitSeconds = NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds),
                    MaxTabSwitches = NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches),
                    Questions = questions
                        .OrderBy(q => q.SortOrder)
                        .Select(q => new LessonExerciseQuestionDto
                        {
                            Id = q.Id,
                            Question = q.Question,
                            OptionA = q.OptionA,
                            OptionB = q.OptionB,
                            OptionC = q.OptionC,
                            OptionD = q.OptionD,
                            SortOrder = q.SortOrder
                        })
                        .ToList()
                }
                : null
        };
    }

}
