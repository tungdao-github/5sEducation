using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class UniqueLearningPathCourseMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_LearningPathCourses_LearningPathId_CourseId",
                table: "LearningPathCourses",
                columns: new[] { "LearningPathId", "CourseId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LearningPathCourses_LearningPathId_CourseId",
                table: "LearningPathCourses");
        }
    }
}
