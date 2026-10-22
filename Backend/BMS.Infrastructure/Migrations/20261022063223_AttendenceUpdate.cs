using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AttendenceUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "Attendences");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Attendences");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateTime",
                table: "Attendences",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateTime",
                table: "Attendences");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "Attendences",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<TimeOnly>(
                name: "Time",
                table: "Attendences",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));
        }
    }
}
