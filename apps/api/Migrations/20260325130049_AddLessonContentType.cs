using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonContentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "Lessons",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "video");

            migrationBuilder.Sql(
                """
                UPDATE Lessons
                SET ContentType = CASE
                    WHEN NULLIF(TRIM(ExerciseQuestion), '') IS NOT NULL THEN 'exercise'
                    ELSE 'video'
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "Lessons");
        }
    }
}
