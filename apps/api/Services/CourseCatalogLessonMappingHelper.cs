using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class CourseCatalogLessonMappingHelper
{
    public static LessonDto MapLesson(Lesson lesson, bool canAccessContent)
    {
        var normalizedType = LessonExerciseHelper.NormalizeContentTypeForResponse(lesson.ContentType, fallbackToExercise: false);

        if (!canAccessContent)
        {
            return new LessonDto
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                ContentType = normalizedType,
                DurationMinutes = lesson.DurationMinutes,
                VideoUrl = string.Empty,
                SortOrder = lesson.SortOrder,
                HasExercise = false,
                Exercise = null
            };
        }

        var questions = GetConfiguredExerciseQuestions(lesson);
        normalizedType = LessonExerciseHelper.NormalizeContentTypeForResponse(lesson.ContentType, questions.Count > 0);
        var hasExercise = questions.Count > 0 && normalizedType == "exercise";

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
                    PassingPercent = LessonExerciseHelper.NormalizePassingPercent(lesson.ExercisePassingPercent),
                    TimeLimitSeconds = LessonExerciseHelper.NormalizeTimeLimitSeconds(lesson.ExerciseTimeLimitSeconds),
                    MaxTabSwitches = LessonExerciseHelper.NormalizeMaxTabSwitches(lesson.ExerciseMaxTabSwitches),
                    Questions = questions
                }
                : null
        };
    }

    public static List<LessonExerciseQuestionDto> GetConfiguredExerciseQuestions(Lesson lesson)
    {
        var structuredQuestions = lesson.ExerciseQuestions
            .Where(q =>
                !string.IsNullOrWhiteSpace(q.Question)
                && !string.IsNullOrWhiteSpace(q.OptionA)
                && !string.IsNullOrWhiteSpace(q.OptionB)
                && !string.IsNullOrWhiteSpace(q.OptionC)
                && !string.IsNullOrWhiteSpace(q.OptionD)
                && q.CorrectOption is >= 1 and <= 4)
            .OrderBy(q => q.SortOrder)
            .ThenBy(q => q.Id)
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
            .ToList();

        if (structuredQuestions.Count > 0)
        {
            return structuredQuestions;
        }

        var hasLegacyQuestion = !string.IsNullOrWhiteSpace(lesson.ExerciseQuestion)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionA)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionB)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionC)
            && !string.IsNullOrWhiteSpace(lesson.ExerciseOptionD)
            && lesson.ExerciseCorrectOption is >= 1 and <= 4;

        if (!hasLegacyQuestion)
        {
            return [];
        }

        return
        [
            new LessonExerciseQuestionDto
            {
                Id = 1,
                Question = lesson.ExerciseQuestion,
                OptionA = lesson.ExerciseOptionA,
                OptionB = lesson.ExerciseOptionB,
                OptionC = lesson.ExerciseOptionC,
                OptionD = lesson.ExerciseOptionD,
                SortOrder = 1
            }
        ];
    }
}
