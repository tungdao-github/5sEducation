using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelAfterOptimizations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Courses_CategoryId",
                table: "Courses");

            migrationBuilder.CreateIndex(
                name: "IX_SupportMessages_Status_CreatedAt",
                table: "SupportMessages",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SupportMessages_UserId_CreatedAt",
                table: "SupportMessages",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status_CreatedAt",
                table: "Orders",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_CourseId",
                table: "OrderItems",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CourseId_SortOrder",
                table: "Lessons",
                columns: new[] { "CourseId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_IsPublished_UpdatedAt",
                table: "LearningPaths",
                columns: new[] { "IsPublished", "UpdatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CategoryId_IsPublished",
                table: "Courses",
                columns: new[] { "CategoryId", "IsPublished" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_IsPublished_CreatedAt",
                table: "Courses",
                columns: new[] { "IsPublished", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_IsPublished_Language",
                table: "Courses",
                columns: new[] { "IsPublished", "Language" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_IsPublished_Level",
                table: "Courses",
                columns: new[] { "IsPublished", "Level" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_IsPublished_UpdatedAt",
                table: "Courses",
                columns: new[] { "IsPublished", "UpdatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_Locale_IsPublished_PublishedAt",
                table: "BlogPosts",
                columns: new[] { "Locale", "IsPublished", "PublishedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SupportMessages_Status_CreatedAt",
                table: "SupportMessages");

            migrationBuilder.DropIndex(
                name: "IX_SupportMessages_UserId_CreatedAt",
                table: "SupportMessages");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Status_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_CourseId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_CourseId_SortOrder",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_LearningPaths_IsPublished_UpdatedAt",
                table: "LearningPaths");

            migrationBuilder.DropIndex(
                name: "IX_Courses_CategoryId_IsPublished",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_IsPublished_CreatedAt",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_IsPublished_Language",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_IsPublished_Level",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_IsPublished_UpdatedAt",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_BlogPosts_Locale_IsPublished_PublishedAt",
                table: "BlogPosts");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CategoryId",
                table: "Courses",
                column: "CategoryId");
        }
    }
}
