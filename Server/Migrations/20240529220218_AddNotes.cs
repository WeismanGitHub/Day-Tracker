using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NumberValue",
                table: "Entries",
                newName: "Value");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Entries",
                type: "TEXT",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Entries");

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "Entries",
                newName: "NumberValue");
        }
    }
}
