using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Password = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Charts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Charts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Charts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateTable(
                name: "ScaleEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ChartId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Rating = table.Column<uint>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScaleEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScaleEntries_Charts_ChartId",
                        column: x => x.ChartId,
                        principalTable: "Charts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Charts_UserId",
                table: "Charts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckmarkEntries_ChartId",
                table: "CheckmarkEntries",
                column: "ChartId");

            migrationBuilder.CreateIndex(
                name: "IX_CounterEntries_ChartId",
                table: "CounterEntries",
                column: "ChartId");

            migrationBuilder.CreateIndex(
                name: "IX_ScaleEntries_ChartId",
                table: "ScaleEntries",
                column: "ChartId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheckmarkEntries");

            migrationBuilder.DropTable(
                name: "CounterEntries");

            migrationBuilder.DropTable(
                name: "ScaleEntries");

            migrationBuilder.DropTable(
                name: "Charts");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
