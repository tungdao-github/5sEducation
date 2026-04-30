using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static partial class LessonExerciseHelper
{
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
