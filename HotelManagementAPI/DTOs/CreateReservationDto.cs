using System.ComponentModel.DataAnnotations;

namespace HotelManagementAPI.DTOs
{
    public class CreateReservationDto
    {
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

        public decimal AmountPaid { get; set; } = 0;

        public string? SpecialRequests { get; set; }
    }
}