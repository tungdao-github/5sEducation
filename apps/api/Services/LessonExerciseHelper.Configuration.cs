using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static partial class LessonExerciseHelper
{
    public static void ApplyExerciseConfiguration(Lesson lesson, ExerciseConfiguration configuration)
    {
        lesson.ExerciseQuestions.Clear();

        if (!configuration.HasExercise)
        {
            lesson.ExerciseQuestion = string.Empty;
            lesson.ExerciseOptionA = string.Empty;
            lesson.ExerciseOptionB = string.Empty;
            lesson.ExerciseOptionC = string.Empty;
            lesson.ExerciseOptionD = string.Empty;
            lesson.ExerciseCorrectOption = null;
            lesson.ExerciseExplanation = string.Empty;
            lesson.ExercisePassingPercent = 80;
            lesson.ExerciseTimeLimitSeconds = 0;
            lesson.ExerciseMaxTabSwitches = 2;
            return;
        }

        var firstQuestion = configuration.Questions.First();
        lesson.ExerciseQuestion = firstQuestion.Question;
        lesson.ExerciseOptionA = firstQuestion.OptionA;
        lesson.ExerciseOptionB = firstQuestion.OptionB;
        lesson.ExerciseOptionC = firstQuestion.OptionC;
        lesson.ExerciseOptionD = firstQuestion.OptionD;
        lesson.ExerciseCorrectOption = firstQuestion.CorrectOption;
        lesson.ExerciseExplanation = firstQuestion.Explanation;
        lesson.ExercisePassingPercent = NormalizePassingPercent(configuration.PassingPercent);
        lesson.ExerciseTimeLimitSeconds = NormalizeTimeLimitSeconds(configuration.TimeLimitSeconds);
        lesson.ExerciseMaxTabSwitches = NormalizeMaxTabSwitches(configuration.MaxTabSwitches);

        foreach (var question in configuration.Questions.OrderBy(q => q.SortOrder))
        {
            lesson.ExerciseQuestions.Add(new LessonExerciseQuestion
            {
                Question = question.Question,
                OptionA = question.OptionA,
                OptionB = question.OptionB,
                OptionC = question.OptionC,
                OptionD = question.OptionD,
                CorrectOption = question.CorrectOption,
                Explanation = question.Explanation,
                SortOrder = question.SortOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }

    public readonly record struct ExerciseConfiguration(
        List<ExerciseQuestionData> Questions,
        int PassingPercent,
        int TimeLimitSeconds,
        int MaxTabSwitches)
    {
        public bool HasExercise => Questions.Count > 0;

        public static ExerciseConfiguration Empty => new([], 80, 0, 2);
    }

    public readonly record struct ExerciseQuestionData(
        int Id,
        string Question,
        string OptionA,
        string OptionB,
        string OptionC,
        string OptionD,
        int CorrectOption,
        string Explanation,
        int SortOrder)
    {
        public static ExerciseQuestionData Empty => new(
            0,
            string.Empty,
            string.Empty,
            string.Empty,
            string.Empty,
            string.Empty,
            0,
            string.Empty,
            0);
    }
}
