using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TeamUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_TeamUser",
                table: "TeamUser");

            migrationBuilder.DropIndex(
                name: "IX_TeamUser_TeamId",
                table: "TeamUser");

            migrationBuilder.AddColumn<int>(
                name: "TeamId",
                table: "Projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_TeamUser",
                table: "TeamUser",
                columns: new[] { "TeamId", "MembersId" });

            migrationBuilder.CreateIndex(
                name: "IX_TeamUser_MembersId",
                table: "TeamUser",
                column: "MembersId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_TeamId",
                table: "Projects",
                column: "TeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Teams_TeamId",
                table: "Projects",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Teams_TeamId",
                table: "Projects");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TeamUser",
                table: "TeamUser");

            migrationBuilder.DropIndex(
                name: "IX_TeamUser_MembersId",
                table: "TeamUser");

            migrationBuilder.DropIndex(
                name: "IX_Projects_TeamId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "TeamId",
                table: "Projects");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TeamUser",
                table: "TeamUser",
                columns: new[] { "MembersId", "TeamId" });

            migrationBuilder.CreateIndex(
                name: "IX_TeamUser_TeamId",
                table: "TeamUser",
                column: "TeamId");
        }
    }
}
