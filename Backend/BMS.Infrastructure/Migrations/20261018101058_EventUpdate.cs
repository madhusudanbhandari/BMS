using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EventUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Events_EventId",
                table: "Notifications");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "Notifications",
                newName: "ActivityEventId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_EventId",
                table: "Notifications",
                newName: "IX_Notifications_ActivityEventId");

            migrationBuilder.CreateTable(
                name: "ActivityEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ActorUser = table.Column<int>(type: "integer", nullable: false),
                    TargetUser = table.Column<int>(type: "integer", nullable: true),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RelatedEntity = table.Column<string>(type: "text", nullable: true),
                    RelatedEntityId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityEvents_OrganizationId_CreatedAt",
                table: "ActivityEvents",
                columns: new[] { "OrganizationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityEvents_TargetUser_CreatedAt",
                table: "ActivityEvents",
                columns: new[] { "TargetUser", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_ActivityEvents_ActivityEventId",
                table: "Notifications",
                column: "ActivityEventId",
                principalTable: "ActivityEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_ActivityEvents_ActivityEventId",
                table: "Notifications");

            migrationBuilder.DropTable(
                name: "ActivityEvents");

            migrationBuilder.RenameColumn(
                name: "ActivityEventId",
                table: "Notifications",
                newName: "EventId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_ActivityEventId",
                table: "Notifications",
                newName: "IX_Notifications_EventId");

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ActorUser = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    OrganizationId = table.Column<int>(type: "integer", nullable: false),
                    RelatedEntity = table.Column<string>(type: "text", nullable: true),
                    RelatedEntityId = table.Column<int>(type: "integer", nullable: true),
                    TargetUser = table.Column<int>(type: "integer", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Events_OrganizationId_CreatedAt",
                table: "Events",
                columns: new[] { "OrganizationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Events_TargetUser_CreatedAt",
                table: "Events",
                columns: new[] { "TargetUser", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Events_EventId",
                table: "Notifications",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
