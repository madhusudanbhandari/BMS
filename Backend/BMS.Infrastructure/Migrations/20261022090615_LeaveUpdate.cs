using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LeaveUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Leaves_Users_ReviewedByIdId",
                table: "Leaves");

            migrationBuilder.DropIndex(
                name: "IX_Leaves_ReviewedByIdId",
                table: "Leaves");

            migrationBuilder.RenameColumn(
                name: "ReviewedByIdId",
                table: "Leaves",
                newName: "ReviewedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ReviewedById",
                table: "Leaves",
                newName: "ReviewedByIdId");

            migrationBuilder.CreateIndex(
                name: "IX_Leaves_ReviewedByIdId",
                table: "Leaves",
                column: "ReviewedByIdId");

            migrationBuilder.AddForeignKey(
                name: "FK_Leaves_Users_ReviewedByIdId",
                table: "Leaves",
                column: "ReviewedByIdId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
