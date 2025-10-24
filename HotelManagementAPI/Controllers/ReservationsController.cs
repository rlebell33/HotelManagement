using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementAPI.Data;
using HotelManagementAPI.Models;
using HotelManagementAPI.DTOs;

namespace HotelManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly HotelManagementContext _context;

        public ReservationsController(HotelManagementContext context)
        {
            _context = context;
        }

        // GET: api/Reservations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetReservations()
        {
            return await _context.Reservations
                .Where(r => r.IsActive)
                .Select(r => new
                {
                    r.ReservationId,
                    r.GuestId,
                    r.RoomId,
                    r.CheckInDate,
                    r.CheckOutDate,
                    r.NumberOfGuests,
                    r.TotalAmount,
                    r.AmountPaid,
                    r.Status,
                    r.SpecialRequests,
                    r.ReservationDate,
                    r.CheckInTime,
                    r.CheckOutTime,
                    Guest = new
                    {
                        r.Guest.GuestId,
                        r.Guest.FirstName,
                        r.Guest.LastName,
                        r.Guest.Email
                    },
                    Room = new
                    {
                        r.Room.RoomId,
                        r.Room.RoomNumber,
                        r.Room.RoomType,
                        r.Room.PricePerNight,
                        Hotel = new
                        {
                            r.Room.Hotel.HotelId,
                            r.Room.Hotel.Name,
                            r.Room.Hotel.City
                        }
                    }
                })
                .OrderByDescending(r => r.ReservationDate)
                .ToListAsync();
        }

        // GET: api/Reservations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetReservation(int id)
        {
            var reservation = await _context.Reservations
                .Where(r => r.ReservationId == id)
                .Select(r => new
                {
                    r.ReservationId,
                    r.GuestId,
                    r.RoomId,
                    r.CheckInDate,
                    r.CheckOutDate,
                    r.NumberOfGuests,
                    r.TotalAmount,
                    r.AmountPaid,
                    r.Status,
                    r.SpecialRequests,
                    r.ReservationDate,
                    r.CheckInTime,
                    r.CheckOutTime,
                    Guest = new
                    {
                        r.Guest.GuestId,
                        r.Guest.FirstName,
                        r.Guest.LastName,
                        r.Guest.Email,
                        r.Guest.Phone
                    },
                    Room = new
                    {
                        r.Room.RoomId,
                        r.Room.RoomNumber,
                        r.Room.RoomType,
                        r.Room.PricePerNight,
                        r.Room.Capacity,
                        Hotel = new
                        {
                            r.Room.Hotel.HotelId,
                            r.Room.Hotel.Name,
                            r.Room.Hotel.Address,
                            r.Room.Hotel.City
                        }
                    }
                })
                .FirstOrDefaultAsync();

            if (reservation == null)
            {
                return NotFound();
            }

            return reservation;
        }

        // PUT: api/Reservations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReservation(int id, Reservation reservation)
        {
            if (id != reservation.ReservationId)
            {
                return BadRequest();
            }

            // Validate dates
            if (reservation.CheckOutDate <= reservation.CheckInDate)
            {
                return BadRequest("Check-out date must be after check-in date");
            }

            // Check for room availability (excluding current reservation)
            var conflictingReservation = await _context.Reservations
                .AnyAsync(r => r.RoomId == reservation.RoomId &&
                              r.ReservationId != id &&
                              r.IsActive &&
                              r.Status != "Cancelled" &&
                              r.CheckInDate < reservation.CheckOutDate &&
                              r.CheckOutDate > reservation.CheckInDate);

            if (conflictingReservation)
            {
                return BadRequest("Room is not available for the selected dates");
            }

            _context.Entry(reservation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReservationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Reservations
        [HttpPost]
        public async Task<ActionResult<object>> PostReservation(CreateReservationDto reservationDto)
        {
            // Validate dates
            if (reservationDto.CheckOutDate <= reservationDto.CheckInDate)
            {
                return BadRequest("Check-out date must be after check-in date");
            }

            if (reservationDto.CheckInDate < DateTime.Today)
            {
                return BadRequest("Check-in date cannot be in the past");
            }

            // Validate guest exists
            var guest = await _context.Guests.FindAsync(reservationDto.GuestId);
            if (guest == null || !guest.IsActive)
            {
                return BadRequest("Guest not found or inactive");
            }

            // Validate room exists and is available
            var room = await _context.Rooms.FindAsync(reservationDto.RoomId);
            if (room == null || !room.IsActive || !room.IsAvailable)
            {
                return BadRequest("Room not found, inactive, or unavailable");
            }

            // Check for room availability
            var conflictingReservation = await _context.Reservations
                .AnyAsync(r => r.RoomId == reservationDto.RoomId &&
                              r.IsActive &&
                              r.Status != "Cancelled" &&
                              r.CheckInDate < reservationDto.CheckOutDate &&
                              r.CheckOutDate > reservationDto.CheckInDate);

            if (conflictingReservation)
            {
                return BadRequest("Room is not available for the selected dates");
            }

            // Calculate total amount
            var numberOfNights = (reservationDto.CheckOutDate - reservationDto.CheckInDate).Days;
            var totalAmount = numberOfNights * room.PricePerNight;

            // Create the reservation entity
            var reservation = new Reservation
            {
                GuestId = reservationDto.GuestId,
                RoomId = reservationDto.RoomId,
                CheckInDate = reservationDto.CheckInDate,
                CheckOutDate = reservationDto.CheckOutDate,
                NumberOfGuests = reservationDto.NumberOfGuests,
                TotalAmount = totalAmount,
                AmountPaid = reservationDto.AmountPaid,
                SpecialRequests = reservationDto.SpecialRequests,
                ReservationDate = DateTime.UtcNow,
                IsActive = true,
                Status = "Confirmed"
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            // Return the created reservation with related data
            var createdReservation = await _context.Reservations
                .Where(r => r.ReservationId == reservation.ReservationId)
                .Select(r => new
                {
                    r.ReservationId,
                    r.GuestId,
                    r.RoomId,
                    r.CheckInDate,
                    r.CheckOutDate,
                    r.NumberOfGuests,
                    r.TotalAmount,
                    r.AmountPaid,
                    r.Status,
                    r.SpecialRequests,
                    r.ReservationDate,
                    Guest = new
                    {
                        r.Guest.GuestId,
                        r.Guest.FirstName,
                        r.Guest.LastName,
                        r.Guest.Email
                    },
                    Room = new
                    {
                        r.Room.RoomId,
                        r.Room.RoomNumber,
                        r.Room.RoomType,
                        r.Room.PricePerNight,
                        Hotel = new
                        {
                            r.Room.Hotel.HotelId,
                            r.Room.Hotel.Name,
                            r.Room.Hotel.City
                        }
                    }
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetReservation", new { id = reservation.ReservationId }, createdReservation);
        }

        // DELETE: api/Reservations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            // Soft delete
            reservation.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Reservations/5/CheckIn
        [HttpPost("{id}/checkin")]
        public async Task<IActionResult> CheckIn(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null || !reservation.IsActive)
            {
                return NotFound();
            }

            if (reservation.Status != "Confirmed")
            {
                return BadRequest("Only confirmed reservations can be checked in");
            }

            reservation.Status = "CheckedIn";
            reservation.CheckInTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Guest checked in successfully", checkInTime = reservation.CheckInTime });
        }

        // POST: api/Reservations/5/CheckOut
        [HttpPost("{id}/checkout")]
        public async Task<IActionResult> CheckOut(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null || !reservation.IsActive)
            {
                return NotFound();
            }

            if (reservation.Status != "CheckedIn")
            {
                return BadRequest("Only checked-in reservations can be checked out");
            }

            reservation.Status = "CheckedOut";
            reservation.CheckOutTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Guest checked out successfully", checkOutTime = reservation.CheckOutTime });
        }

        // POST: api/Reservations/5/Cancel
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null || !reservation.IsActive)
            {
                return NotFound();
            }

            if (reservation.Status == "CheckedOut")
            {
                return BadRequest("Cannot cancel a completed reservation");
            }

            reservation.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled successfully" });
        }

        // GET: api/Reservations/Search?status=Confirmed&checkInDate=2023-12-01
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Reservation>>> SearchReservations(
            string? status = null,
            DateTime? checkInDate = null,
            DateTime? checkOutDate = null,
            int? guestId = null,
            int? roomId = null)
        {
            var query = _context.Reservations
                .Where(r => r.IsActive)
                .Include(r => r.Guest)
                .Include(r => r.Room)
                .ThenInclude(r => r.Hotel)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status.ToLower() == status.ToLower());

            if (checkInDate.HasValue)
                query = query.Where(r => r.CheckInDate.Date == checkInDate.Value.Date);

            if (checkOutDate.HasValue)
                query = query.Where(r => r.CheckOutDate.Date == checkOutDate.Value.Date);

            if (guestId.HasValue)
                query = query.Where(r => r.GuestId == guestId.Value);

            if (roomId.HasValue)
                query = query.Where(r => r.RoomId == roomId.Value);

            return await query.OrderByDescending(r => r.ReservationDate).ToListAsync();
        }

        private bool ReservationExists(int id)
        {
            return _context.Reservations.Any(e => e.ReservationId == id);
        }
    }
}