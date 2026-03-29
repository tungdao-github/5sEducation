using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancedLessonExerciseQuiz : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExerciseMaxTabSwitches",
                table: "Lessons",
                type: "int",
                nullable: false,
                defaultValue: 2);

            migrationBuilder.AddColumn<int>(
                name: "ExercisePassingPercent",
                table: "Lessons",
                type: "int",
                nullable: false,
                defaultValue: 80);

            migrationBuilder.AddColumn<int>(
                name: "ExerciseTimeLimitSeconds",
                table: "Lessons",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "SelectedOption",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "AllowedTabSwitches",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AllowedTimeSeconds",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AnswersJson",
                table: "LessonExerciseAttempts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CorrectAnswers",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Passed",
                table: "LessonExerciseAttempts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "ScorePercent",
                table: "LessonExerciseAttempts",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "LessonExerciseAttempts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TabSwitchCount",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "TabViolation",
                table: "LessonExerciseAttempts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TimeSpentSeconds",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "TimedOut",
                table: "LessonExerciseAttempts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestions",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "LessonExerciseQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LessonId = table.Column<int>(type: "int", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OptionA = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OptionB = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OptionC = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OptionD = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CorrectOption = table.Column<int>(type: "int", nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonExerciseQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonExerciseQuestions_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LessonExerciseAttempts_EnrollmentId_LessonId_AttemptedAt",
                table: "LessonExerciseAttempts",
                columns: new[] { "EnrollmentId", "LessonId", "AttemptedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonExerciseQuestions_LessonId_SortOrder",
                table: "LessonExerciseQuestions",
                columns: new[] { "LessonId", "SortOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LessonExerciseQuestions");

            migrationBuilder.DropIndex(
                name: "IX_LessonExerciseAttempts_EnrollmentId_LessonId_AttemptedAt",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "ExerciseMaxTabSwitches",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExercisePassingPercent",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseTimeLimitSeconds",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "AllowedTabSwitches",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "AllowedTimeSeconds",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "AnswersJson",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "CorrectAnswers",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "Passed",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "ScorePercent",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "TabSwitchCount",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "TabViolation",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "TimeSpentSeconds",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "TimedOut",
                table: "LessonExerciseAttempts");

            migrationBuilder.DropColumn(
                name: "TotalQuestions",
                table: "LessonExerciseAttempts");

            migrationBuilder.AlterColumn<int>(
                name: "SelectedOption",
                table: "LessonExerciseAttempts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
