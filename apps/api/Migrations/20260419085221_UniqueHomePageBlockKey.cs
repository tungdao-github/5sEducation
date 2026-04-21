using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.Api.Migrations
{
    /// <inheritdoc />
    public partial class UniqueHomePageBlockKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HomePageBlocks_Key",
                table: "HomePageBlocks");

            migrationBuilder.CreateIndex(
                name: "IX_HomePageBlocks_Key",
                table: "HomePageBlocks",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HomePageBlocks_Key",
                table: "HomePageBlocks");

            migrationBuilder.CreateIndex(
                name: "IX_HomePageBlocks_Key",
                table: "HomePageBlocks",
                column: "Key");
        }
    }
}
