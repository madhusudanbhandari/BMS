using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AttendenceUpdate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MarkedToday",
                table: "Attendences");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MarkedToday",
                table: "Attendences",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
