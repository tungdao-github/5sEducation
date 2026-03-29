using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using UdemyClone.Api.Data;

#nullable disable

namespace UdemyClone.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260328190000_UpdateBlogSeoDescriptionLength")]
public partial class UpdateBlogSeoDescriptionLength : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "SeoDescription",
            table: "BlogPosts",
            type: "nvarchar(1000)",
            maxLength: 1000,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(300)",
            oldMaxLength: 300);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "SeoDescription",
            table: "BlogPosts",
            type: "nvarchar(300)",
            maxLength: 300,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(1000)",
            oldMaxLength: 1000);
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
