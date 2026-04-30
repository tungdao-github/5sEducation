using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static partial class LessonExerciseHelper
{
    public static bool HasAnyExerciseInput(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput,
        List<LessonExerciseQuestionInputDto>? questionInputs)
    {
        return HasAnyLegacyExerciseInput(
                   questionInput,
                   optionAInput,
                   optionBInput,
                   optionCInput,
                   optionDInput,
                   correctOption,
                   explanationInput)
               || (questionInputs?.Any(HasAnyQuestionInput) ?? false);
    }

    public static bool HasAnyLegacyExerciseInput(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput)
    {
        return !string.IsNullOrWhiteSpace(questionInput)
            || !string.IsNullOrWhiteSpace(optionAInput)
            || !string.IsNullOrWhiteSpace(optionBInput)
            || !string.IsNullOrWhiteSpace(optionCInput)
            || !string.IsNullOrWhiteSpace(optionDInput)
            || !string.IsNullOrWhiteSpace(explanationInput)
            || correctOption.HasValue;
    }

    public static bool HasAnyQuestionInput(LessonExerciseQuestionInputDto? input)
    {
        if (input is null)
        {
            return false;
        }

        return !string.IsNullOrWhiteSpace(input.Question)
            || !string.IsNullOrWhiteSpace(input.OptionA)
            || !string.IsNullOrWhiteSpace(input.OptionB)
            || !string.IsNullOrWhiteSpace(input.OptionC)
            || !string.IsNullOrWhiteSpace(input.OptionD)
            || !string.IsNullOrWhiteSpace(input.Explanation)
            || input.CorrectOption != 0;
    }

    public static bool TryNormalizeContentType(string? contentTypeInput, out string contentType, out string error)
    {
        var normalized = (contentTypeInput ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalized))
        {
            contentType = VideoContentType;
            error = string.Empty;
            return true;
        }

        if (normalized is VideoContentType or ExerciseContentType)
        {
            contentType = normalized;
            error = string.Empty;
            return true;
        }

        contentType = string.Empty;
        error = "ContentType must be either 'video' or 'exercise'.";
        return false;
    }

    public static string NormalizeContentTypeForResponse(string? contentTypeInput, bool fallbackToExercise)
    {
        var normalized = (contentTypeInput ?? string.Empty).Trim().ToLowerInvariant();
        if (normalized == ExerciseContentType)
        {
            return ExerciseContentType;
        }

        if (fallbackToExercise)
        {
            return ExerciseContentType;
        }

        return VideoContentType;
    }

    public static bool IsExerciseContentType(string? contentTypeInput)
    {
        return NormalizeContentTypeForResponse(contentTypeInput, fallbackToExercise: false) == ExerciseContentType;
    }

    public static bool IsExerciseConfigured(Lesson lesson)
    {
        return IsExerciseContentType(lesson.ContentType)
            && GetConfiguredQuestions(lesson).Count > 0;
    }

    public static string GetMessageForCode(string messageCode)
    {
        return messageCode switch
        {
            "passed" => "Excellent work. You passed this exercise.",
            "timed_out" => "Time is up for this exercise. Please try again.",
            "tab_violation" => "Exercise locked because the tab was switched too many times.",
            _ => "Not passed yet. Review and try again."
        };
    }
}
