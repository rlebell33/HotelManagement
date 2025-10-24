using Microsoft.EntityFrameworkCore;
using HotelManagementAPI.Models;

namespace HotelManagementAPI.Data
{
    public class HotelManagementContext : DbContext
    {
        public HotelManagementContext(DbContextOptions<HotelManagementContext> options) : base(options)
        {
        }

        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Hotel configuration
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.HasKey(e => e.HotelId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(200);
                entity.Property(e => e.City).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Country).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.StarRating).HasDefaultValue(3);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Room configuration
            modelBuilder.Entity<Room>(entity =>
            {
                entity.HasKey(e => e.RoomId);
                entity.Property(e => e.RoomNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.RoomType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PricePerNight).HasColumnType("decimal(10,2)");
                entity.Property(e => e.IsAvailable).HasDefaultValue(true);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(r => r.Hotel)
                      .WithMany(h => h.Rooms)
                      .HasForeignKey(r => r.HotelId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.HotelId, e.RoomNumber }).IsUnique();
            });

            // Guest configuration
            modelBuilder.Entity<Guest>(entity =>
            {
                entity.HasKey(e => e.GuestId);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.City).HasMaxLength(50);
                entity.Property(e => e.Country).HasMaxLength(50);
                entity.Property(e => e.PassportNumber).HasMaxLength(20);
                entity.Property(e => e.Gender).HasMaxLength(10);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Reservation configuration
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.ReservationId);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(10,2)");
                entity.Property(e => e.AmountPaid).HasColumnType("decimal(10,2)").HasDefaultValue(0);
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Confirmed");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.ReservationDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(r => r.Guest)
                      .WithMany(g => g.Reservations)
                      .HasForeignKey(r => r.GuestId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Room)
                      .WithMany(rm => rm.Reservations)
                      .HasForeignKey(r => r.RoomId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Prevent overlapping reservations for the same room
                entity.HasIndex(e => new { e.RoomId, e.CheckInDate, e.CheckOutDate });
            });
        }
    }
}