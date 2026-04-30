using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public static partial class LessonExerciseHelper
{
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
}
