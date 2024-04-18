using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class FinishRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScaleEntries_Charts_ChartId",
                table: "ScaleEntries");

            migrationBuilder.DropTable(
                name: "CheckmarkEntries");

            migrationBuilder.DropTable(
                name: "CounterEntries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ScaleEntries",
                table: "ScaleEntries");

            migrationBuilder.RenameTable(
                name: "ScaleEntries",
                newName: "EntryBase");

            migrationBuilder.RenameIndex(
                name: "IX_ScaleEntries_ChartId",
                table: "EntryBase",
                newName: "IX_EntryBase_ChartId");

            migrationBuilder.AlterColumn<uint>(
                name: "Rating",
                table: "EntryBase",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(uint),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<bool>(
                name: "Checked",
                table: "EntryBase",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<uint>(
                name: "Counter",
                table: "EntryBase",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "EntryBase",
                type: "TEXT",
                maxLength: 21,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EntryBase",
                table: "EntryBase",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_EntryBase_Charts_ChartId",
                table: "EntryBase",
                column: "ChartId",
                principalTable: "Charts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EntryBase_Charts_ChartId",
                table: "EntryBase");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EntryBase",
                table: "EntryBase");

            migrationBuilder.DropColumn(
                name: "Checked",
                table: "EntryBase");

            migrationBuilder.DropColumn(
                name: "Counter",
                table: "EntryBase");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "EntryBase");

            migrationBuilder.RenameTable(
                name: "EntryBase",
                newName: "ScaleEntries");

            migrationBuilder.RenameIndex(
                name: "IX_EntryBase_ChartId",
                table: "ScaleEntries",
                newName: "IX_ScaleEntries_ChartId");

            migrationBuilder.AlterColumn<uint>(
                name: "Rating",
                table: "ScaleEntries",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0u,
                oldClrType: typeof(uint),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ScaleEntries",
                table: "ScaleEntries",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "CheckmarkEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ChartId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Checked = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckmarkEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckmarkEntries_Charts_ChartId",
                        column: x => x.ChartId,
                        principalTable: "Charts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CounterEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ChartId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Counter = table.Column<uint>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CounterEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CounterEntries_Charts_ChartId",
                        column: x => x.ChartId,
                        principalTable: "Charts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheckmarkEntries_ChartId",
                table: "CheckmarkEntries",
                column: "ChartId");

            migrationBuilder.CreateIndex(
                name: "IX_CounterEntries_ChartId",
                table: "CounterEntries",
                column: "ChartId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScaleEntries_Charts_ChartId",
                table: "ScaleEntries",
                column: "ChartId",
                principalTable: "Charts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
