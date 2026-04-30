using UdemyClone.Api.Dtos;

namespace UdemyClone.Api.Services;

public static partial class LessonExerciseHelper
{
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
}
