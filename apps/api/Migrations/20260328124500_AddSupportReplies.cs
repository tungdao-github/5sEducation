using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using UdemyClone.Api.Data;

#nullable disable

namespace UdemyClone.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260328124500_AddSupportReplies")]
public partial class AddSupportReplies : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "SupportReplies",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                SupportMessageId = table.Column<int>(type: "int", nullable: false),
                AuthorRole = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                AuthorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SupportReplies", x => x.Id);
                table.ForeignKey(
                    name: "FK_SupportReplies_SupportMessages_SupportMessageId",
                    column: x => x.SupportMessageId,
                    principalTable: "SupportMessages",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_SupportReplies_SupportMessageId_CreatedAt",
            table: "SupportReplies",
            columns: new[] { "SupportMessageId", "CreatedAt" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "SupportReplies");
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
