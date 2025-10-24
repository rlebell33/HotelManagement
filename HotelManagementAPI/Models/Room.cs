using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HotelManagementAPI.Models
{
    public class Room
    {
        [Key]
        public int RoomId { get; set; }

        [Required]
        [StringLength(20)]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        public int HotelId { get; set; }

        [Required]
        [StringLength(50)]
        public string RoomType { get; set; } = string.Empty; // Single, Double, Suite, etc.

        [Range(1, 10)]
        public int Capacity { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerNight { get; set; }

        public string? Description { get; set; }

        public bool HasWifi { get; set; } = true;
        public bool HasAC { get; set; } = true;
        public bool HasTV { get; set; } = true;
        public bool HasMinibar { get; set; } = false;

        public bool IsAvailable { get; set; } = true;
        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("HotelId")]
        [JsonIgnore]
        public virtual Hotel Hotel { get; set; } = null!;

        [JsonIgnore]
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}