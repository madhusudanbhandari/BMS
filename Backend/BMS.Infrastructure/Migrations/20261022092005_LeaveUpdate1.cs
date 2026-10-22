using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LeaveUpdate1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "Leaves",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Leaves_OrganizationId",
                table: "Leaves",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Leaves_Organizations_OrganizationId",
                table: "Leaves",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Leaves_Organizations_OrganizationId",
                table: "Leaves");

            migrationBuilder.DropIndex(
                name: "IX_Leaves_OrganizationId",
                table: "Leaves");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Leaves");
        }
    }
}
