using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixBlogCommentUserForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlogCommentLikes_AspNetUsers_UserId",
                table: "BlogCommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_BlogComments_AspNetUsers_UserId",
                table: "BlogComments");

            migrationBuilder.AddForeignKey(
                name: "FK_BlogCommentLikes_AspNetUsers_UserId",
                table: "BlogCommentLikes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BlogComments_AspNetUsers_UserId",
                table: "BlogComments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlogCommentLikes_AspNetUsers_UserId",
                table: "BlogCommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_BlogComments_AspNetUsers_UserId",
                table: "BlogComments");

            migrationBuilder.AddForeignKey(
                name: "FK_BlogCommentLikes_AspNetUsers_UserId",
                table: "BlogCommentLikes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BlogComments_AspNetUsers_UserId",
                table: "BlogComments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
