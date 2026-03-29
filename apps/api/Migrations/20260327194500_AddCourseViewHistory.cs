using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using UdemyClone.Api.Data;

#nullable disable

namespace UdemyClone.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260327194500_AddCourseViewHistory")]
public partial class AddCourseViewHistory : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "CourseViewHistories",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                CourseId = table.Column<int>(type: "int", nullable: false),
                ViewedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CourseViewHistories", x => x.Id);
                table.ForeignKey(
                    name: "FK_CourseViewHistories_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_CourseViewHistories_Courses_CourseId",
                    column: x => x.CourseId,
                    principalTable: "Courses",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_CourseViewHistories_CourseId",
            table: "CourseViewHistories",
            column: "CourseId");

        migrationBuilder.CreateIndex(
            name: "IX_CourseViewHistories_UserId_CourseId",
            table: "CourseViewHistories",
            columns: new[] { "UserId", "CourseId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_CourseViewHistories_UserId_ViewedAt",
            table: "CourseViewHistories",
            columns: new[] { "UserId", "ViewedAt" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "CourseViewHistories");
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
