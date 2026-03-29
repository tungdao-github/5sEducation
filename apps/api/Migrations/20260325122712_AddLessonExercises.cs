using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExerciseCorrectOption",
                table: "Lessons",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExerciseExplanation",
                table: "Lessons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseOptionA",
                table: "Lessons",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseOptionB",
                table: "Lessons",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseOptionC",
                table: "Lessons",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseOptionD",
                table: "Lessons",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExerciseQuestion",
                table: "Lessons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExerciseCorrectOption",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseExplanation",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseOptionA",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseOptionB",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseOptionC",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseOptionD",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "ExerciseQuestion",
                table: "Lessons");
        }
    }
}
