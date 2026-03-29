using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using UdemyClone.Api.Data;

#nullable disable

namespace UdemyClone.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260328180000_AddBlogPosts")]
public partial class AddBlogPosts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "BlogPosts",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CoverImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                AuthorName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                TagsCsv = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                SeoTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                SeoDescription = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                IsPublished = table.Column<bool>(type: "bit", nullable: false),
                PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_BlogPosts", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_BlogPosts_Locale_IsPublished",
            table: "BlogPosts",
            columns: new[] { "Locale", "IsPublished" });

        migrationBuilder.CreateIndex(
            name: "IX_BlogPosts_PublishedAt",
            table: "BlogPosts",
            column: "PublishedAt");

        migrationBuilder.CreateIndex(
            name: "IX_BlogPosts_Slug",
            table: "BlogPosts",
            column: "Slug",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "BlogPosts");
    }

    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
        new Snapshot().Build(modelBuilder);
    }

    private sealed class Snapshot : ApplicationDbContextModelSnapshot
    {
        public void Build(ModelBuilder modelBuilder)
        {
            base.BuildModel(modelBuilder);
        }
    }
}
