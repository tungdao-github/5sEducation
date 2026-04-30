"use client";

type QuizQuestion = {
  numericId: number;
  id: string;
  question: string;
  options: string[];
};

type Props = {
  question: QuizQuestion;
  selectedAnswer?: number;
  onSelectAnswer: (questionId: number, optionValue: number) => void;
};

export default function ExerciseQuizQuestion({ question, selectedAnswer, onSelectAnswer }: Props) {
  return (
    <>
      <p className="mb-4 text-lg font-semibold text-gray-900">{question.question}</p>
      <div className="mb-8 space-y-3">
        {question.options.map((option, index) => {
          const optionValue = index + 1;
          const selected = selectedAnswer === optionValue;
          return (
            <button
              key={`${question.id}-${optionValue}`}
              onClick={() => onSelectAnswer(question.numericId, optionValue)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${selected ? "border-blue-500 bg-blue-50 text-blue-900" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
            >
              <div className={`flex size-5 items-center justify-center rounded-full border-2 ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                {selected ? <div className="size-2.5 rounded-full bg-white" /> : null}
              </div>
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
