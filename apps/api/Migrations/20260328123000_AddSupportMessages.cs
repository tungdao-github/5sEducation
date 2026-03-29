using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using UdemyClone.Api.Data;

#nullable disable

namespace UdemyClone.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260328123000_AddSupportMessages")]
public partial class AddSupportMessages : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "SupportMessages",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "open"),
                AdminNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SupportMessages", x => x.Id);
                table.ForeignKey(
                    name: "FK_SupportMessages_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(
            name: "IX_SupportMessages_CreatedAt",
            table: "SupportMessages",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_SupportMessages_Status",
            table: "SupportMessages",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_SupportMessages_UserId",
            table: "SupportMessages",
            column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "SupportMessages");
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
