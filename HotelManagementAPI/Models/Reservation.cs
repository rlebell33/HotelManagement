using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HotelManagementAPI.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationId { get; set; }

        [Required]
        public int GuestId { get; set; }

        [Required]
        public int RoomId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        [Range(1, 20)]
        public int NumberOfGuests { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal AmountPaid { get; set; } = 0;

        [StringLength(20)]
        public string Status { get; set; } = "Confirmed"; // Confirmed, CheckedIn, CheckedOut, Cancelled

        public string? SpecialRequests { get; set; }

        public DateTime ReservationDate { get; set; } = DateTime.UtcNow;

        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("GuestId")]
        [JsonIgnore]
        public virtual Guest? Guest { get; set; }

        [ForeignKey("RoomId")]
        [JsonIgnore]
        public virtual Room? Room { get; set; }

        // Calculated properties
        public int NumberOfNights => (CheckOutDate - CheckInDate).Days;
        public decimal BalanceAmount => TotalAmount - AmountPaid;
        public bool IsFullyPaid => AmountPaid >= TotalAmount;
    }
}