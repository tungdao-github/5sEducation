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

    public static bool TryBuildLegacyQuestion(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput,
        out ExerciseQuestionData question,
        out bool hasLegacyInput,
        out string error)
    {
        hasLegacyInput = HasAnyLegacyExerciseInput(
            questionInput,
            optionAInput,
            optionBInput,
            optionCInput,
            optionDInput,
            correctOption,
            explanationInput);

        if (!hasLegacyInput)
        {
            question = ExerciseQuestionData.Empty;
            error = string.Empty;
            return true;
        }

        var numericCorrectOption = correctOption ?? 0;
        if (!TryBuildQuestion(
                questionInput,
                optionAInput,
                optionBInput,
                optionCInput,
                optionDInput,
                numericCorrectOption,
                explanationInput,
                1,
                out question,
                out error))
        {
            return false;
        }

        return true;
    }

    public static bool TryBuildQuestion(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int correctOption,
        string? explanationInput,
        int sortOrder,
        out ExerciseQuestionData question,
        out string error)
    {
        var normalizedQuestion = (questionInput ?? string.Empty).Trim();
        var optionA = (optionAInput ?? string.Empty).Trim();
        var optionB = (optionBInput ?? string.Empty).Trim();
        var optionC = (optionCInput ?? string.Empty).Trim();
        var optionD = (optionDInput ?? string.Empty).Trim();
        var explanation = (explanationInput ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(normalizedQuestion))
        {
            question = ExerciseQuestionData.Empty;
            error = "Exercise question is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(optionA)
            || string.IsNullOrWhiteSpace(optionB)
            || string.IsNullOrWhiteSpace(optionC)
            || string.IsNullOrWhiteSpace(optionD))
        {
            question = ExerciseQuestionData.Empty;
            error = "Please provide all four answer options for each exercise question.";
            return false;
        }

        if (correctOption is < 1 or > 4)
        {
            question = ExerciseQuestionData.Empty;
            error = "Exercise correct option must be between 1 and 4.";
            return false;
        }

        question = new ExerciseQuestionData(
            Id: 0,
            Question: normalizedQuestion,
            OptionA: optionA,
            OptionB: optionB,
            OptionC: optionC,
            OptionD: optionD,
            CorrectOption: correctOption,
            Explanation: explanation,
            SortOrder: sortOrder <= 0 ? 1 : sortOrder);
        error = string.Empty;
        return true;
    }

    public static bool TryBuildExerciseConfiguration(
        string? questionInput,
        string? optionAInput,
        string? optionBInput,
        string? optionCInput,
        string? optionDInput,
        int? correctOption,
        string? explanationInput,
        List<LessonExerciseQuestionInputDto>? questionInputs,
        int passingPercentInput,
        int timeLimitMinutesInput,
        int maxTabSwitchesInput,
        bool required,
        out ExerciseConfiguration configuration,
        out string error)
    {
        var questions = new List<ExerciseQuestionData>();
        var structuredInputs = questionInputs ?? [];
        var hasLegacyInput = false;
        var legacyQuestion = ExerciseQuestionData.Empty;

        foreach (var (input, index) in structuredInputs.Select((value, index) => (value, index)))
        {
            if (!HasAnyQuestionInput(input))
            {
                continue;
            }

            if (!TryBuildQuestion(
                    input.Question,
                    input.OptionA,
                    input.OptionB,
                    input.OptionC,
                    input.OptionD,
                    input.CorrectOption,
                    input.Explanation,
                    input.SortOrder > 0 ? input.SortOrder : index + 1,
                    out var question,
                    out error))
            {
                configuration = ExerciseConfiguration.Empty;
                return false;
            }

            questions.Add(question);
        }

        if (questions.Count == 0
            && !TryBuildLegacyQuestion(
                questionInput,
                optionAInput,
                optionBInput,
                optionCInput,
                optionDInput,
                correctOption,
                explanationInput,
                out legacyQuestion,
                out hasLegacyInput,
                out error))
        {
            configuration = ExerciseConfiguration.Empty;
            return false;
        }
        else if (questions.Count == 0 && hasLegacyInput)
        {
            questions.Add(legacyQuestion);
        }

        if (required && questions.Count == 0)
        {
            configuration = ExerciseConfiguration.Empty;
            error = "Exercise lessons require at least one question with four answer options.";
            return false;
        }

        if (questions.Count == 0)
        {
            configuration = ExerciseConfiguration.Empty;
            error = string.Empty;
            return true;
        }

        var normalizedQuestions = questions
            .OrderBy(q => q.SortOrder)
            .Select((q, index) => q with { SortOrder = index + 1 })
            .ToList();

        configuration = new ExerciseConfiguration(
            normalizedQuestions,
            NormalizePassingPercent(passingPercentInput),
            NormalizeTimeLimitSeconds(timeLimitMinutesInput * 60),
            NormalizeMaxTabSwitches(maxTabSwitchesInput));

        error = string.Empty;
        return true;
    }

    public static List<ExerciseQuestionData> GetConfiguredQuestions(Lesson lesson)
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
            .Select(q => new ExerciseQuestionData(
                q.Id,
                q.Question,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                q.CorrectOption,
                q.Explanation,
                q.SortOrder))
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
            new ExerciseQuestionData(
                Id: 1,
                Question: lesson.ExerciseQuestion,
                OptionA: lesson.ExerciseOptionA,
                OptionB: lesson.ExerciseOptionB,
                OptionC: lesson.ExerciseOptionC,
                OptionD: lesson.ExerciseOptionD,
                CorrectOption: lesson.ExerciseCorrectOption!.Value,
                Explanation: lesson.ExerciseExplanation,
                SortOrder: 1)
        ];
    }
}
