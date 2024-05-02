﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Server.Database;

#nullable disable

namespace Server.Migrations
{
    [DbContext(typeof(DayTrackerContext))]
    [Migration("20240502111808_RenamePassword")]
    partial class RenamePassword
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.4");

            modelBuilder.Entity("Server.Database.Models.Chart", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<int>("Type")
                        .HasColumnType("INTEGER");

                    b.Property<Guid>("UserId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Charts");
                });

            modelBuilder.Entity("Server.Database.Models.Entry", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<Guid>("ChartId")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("EntryType")
                        .IsRequired()
                        .HasMaxLength(13)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("ChartId");

                    b.ToTable("Entries");

                    b.HasDiscriminator<string>("EntryType").HasValue("Entry");

                    b.UseTphMappingStrategy();
                });

            modelBuilder.Entity("Server.Database.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Server.Database.Models.CheckmarkEntry", b =>
                {
                    b.HasBaseType("Server.Database.Models.Entry");

                    b.Property<bool>("Checked")
                        .HasColumnType("INTEGER");

                    b.HasDiscriminator().HasValue("Checkmark");
                });

            modelBuilder.Entity("Server.Database.Models.CounterEntry", b =>
                {
                    b.HasBaseType("Server.Database.Models.Entry");

                    b.Property<uint>("Counter")
                        .HasColumnType("INTEGER");

                    b.HasDiscriminator().HasValue("Counter");
                });

            modelBuilder.Entity("Server.Database.Models.ScaleEntry", b =>
                {
                    b.HasBaseType("Server.Database.Models.Entry");

                    b.Property<uint>("Rating")
                        .HasColumnType("INTEGER");

                    b.HasDiscriminator().HasValue("Scale");
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
