using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class LessonMutationHelper
{
    public static bool CanEditCourse(string? userId, bool isAdmin, string? instructorId)
    {
        return isAdmin || (!string.IsNullOrWhiteSpace(userId) && instructorId == userId);
    }

    public static bool TryBuildDraft(
        LessonCreateRequest request,
        out LessonMutationDraft draft,
        out string error)
    {
        return TryBuildDraftCore(
            request.Title,
            request.ContentType,
            request.VideoUrl,
            request.DurationMinutes,
            request.SortOrder,
            request.ExerciseQuestion,
            request.ExerciseOptionA,
            request.ExerciseOptionB,
            request.ExerciseOptionC,
            request.ExerciseOptionD,
            request.ExerciseCorrectOption,
            request.ExerciseExplanation,
            request.ExerciseQuestions,
            request.ExercisePassingPercent,
            request.ExerciseTimeLimitMinutes,
            request.ExerciseMaxTabSwitches,
            out draft,
            out error);
    }

    public static bool TryBuildDraft(
        LessonUpdateRequest request,
        out LessonMutationDraft draft,
        out string error)
    {
        return TryBuildDraftCore(
            request.Title,
            request.ContentType,
            request.VideoUrl,
            request.DurationMinutes,
            request.SortOrder,
            request.ExerciseQuestion,
            request.ExerciseOptionA,
            request.ExerciseOptionB,
            request.ExerciseOptionC,
            request.ExerciseOptionD,
            request.ExerciseCorrectOption,
            request.ExerciseExplanation,
            request.ExerciseQuestions,
            request.ExercisePassingPercent,
            request.ExerciseTimeLimitMinutes,
            request.ExerciseMaxTabSwitches,
            out draft,
            out error);
    }

    public static void ApplyDraft(Lesson lesson, LessonMutationDraft draft, bool preserveIdentity = false)
    {
        lesson.Title = draft.Title;
        lesson.ContentType = draft.ContentType;
        lesson.DurationMinutes = draft.DurationMinutes;
        lesson.VideoUrl = draft.ContentType == "video" ? draft.VideoUrl : string.Empty;
        lesson.SortOrder = draft.SortOrder;
        lesson.UpdatedAt = DateTime.UtcNow;

        LessonExerciseHelper.ApplyExerciseConfiguration(lesson, draft.ExerciseConfiguration);
    }

    private static bool TryBuildDraftCore(
        string? title,
        string? contentTypeInput,
        string? videoUrl,
        double durationMinutes,
        int sortOrder,
        string? exerciseQuestion,
        string? exerciseOptionA,
        string? exerciseOptionB,
        string? exerciseOptionC,
        string? exerciseOptionD,
        int? exerciseCorrectOption,
        string? exerciseExplanation,
        List<LessonExerciseQuestionInputDto>? exerciseQuestions,
        int exercisePassingPercent,
        int exerciseTimeLimitMinutes,
        int exerciseMaxTabSwitches,
        out LessonMutationDraft draft,
        out string error)
    {
        var normalizedTitle = (title ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            draft = default;
            error = "Title is required.";
            return false;
        }

        if (!LessonExerciseHelper.TryNormalizeContentType(contentTypeInput, out var contentType, out error))
        {
            draft = default;
            return false;
        }

        if (contentType == "video" && string.IsNullOrWhiteSpace(videoUrl))
        {
            draft = default;
            error = "Video URL is required for video lessons.";
            return false;
        }

        if (contentType == "video"
            && LessonExerciseHelper.HasAnyExerciseInput(
                exerciseQuestion,
                exerciseOptionA,
                exerciseOptionB,
                exerciseOptionC,
                exerciseOptionD,
                exerciseCorrectOption,
                exerciseExplanation,
                exerciseQuestions))
        {
            draft = default;
            error = "Video lessons cannot contain exercise fields.";
            return false;
        }

        if (!LessonExerciseHelper.TryBuildExerciseConfiguration(
                exerciseQuestion,
                exerciseOptionA,
                exerciseOptionB,
                exerciseOptionC,
                exerciseOptionD,
                exerciseCorrectOption,
                exerciseExplanation,
                exerciseQuestions,
                exercisePassingPercent,
                exerciseTimeLimitMinutes,
                exerciseMaxTabSwitches,
                contentType == "exercise",
                out var exerciseConfiguration,
                out error))
        {
            draft = default;
            return false;
        }

        draft = new LessonMutationDraft(
            normalizedTitle,
            contentType,
            contentType == "video" ? (videoUrl ?? string.Empty).Trim() : string.Empty,
            durationMinutes,
            sortOrder,
            exerciseConfiguration);
        error = string.Empty;
        return true;
    }
}

public readonly record struct LessonMutationDraft(
    string Title,
    string ContentType,
    string VideoUrl,
    double DurationMinutes,
    int SortOrder,
    LessonExerciseHelper.ExerciseConfiguration ExerciseConfiguration);
