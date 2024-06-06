﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Server.Database;

#nullable disable

namespace Server.Migrations
{
    [DbContext(typeof(DayTrackerContext))]
    [Migration("20240606190732_ValueToDecimal")]
    partial class ValueToDecimal
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Server.Database.Models.Chart", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<int>("Type")
                        .HasColumnType("integer");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Charts");
                });

            modelBuilder.Entity("Server.Database.Models.Entry", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("ChartId")
                        .HasColumnType("uuid");

                    b.Property<int>("Day")
                        .HasColumnType("integer");

                    b.Property<int>("Month")
                        .HasColumnType("integer");

                    b.Property<string>("Notes")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("character varying(500)");

                    b.Property<decimal>("Value")
                        .HasColumnType("numeric");

                    b.Property<int>("Year")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("ChartId");

                    b.HasIndex("Year");

                    b.ToTable("Entries");
                });

            modelBuilder.Entity("Server.Database.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Server.Database.Models.Chart", b =>
                {
                    b.HasOne("Server.Database.Models.User", "User")
                        .WithMany("Charts")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Server.Database.Models.Entry", b =>
                {
                    b.HasOne("Server.Database.Models.Chart", "Chart")
                        .WithMany("Entries")
                        .HasForeignKey("ChartId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Chart");
                });

            modelBuilder.Entity("Server.Database.Models.Chart", b =>
                {
                    b.Navigation("Entries");
                });

            modelBuilder.Entity("Server.Database.Models.User", b =>
                {
                    b.Navigation("Charts");
                });
#pragma warning restore 612, 618
        }
    }
}
