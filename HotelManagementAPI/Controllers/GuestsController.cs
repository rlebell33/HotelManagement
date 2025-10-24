using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementAPI.Data;
using HotelManagementAPI.Models;

namespace HotelManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GuestsController : ControllerBase
    {
        private readonly HotelManagementContext _context;

        public GuestsController(HotelManagementContext context)
        {
            _context = context;
        }

        // GET: api/Guests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Guest>>> GetGuests()
        {
            return await _context.Guests
                .Where(g => g.IsActive)
                .ToListAsync();
        }

        // GET: api/Guests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetGuest(int id)
        {
            var guest = await _context.Guests
                .Where(g => g.GuestId == id && g.IsActive)
                .Select(g => new
                {
                    g.GuestId,
                    g.FirstName,
                    g.LastName,
                    g.Email,
                    g.Phone,
                    g.Address,
                    g.City,
                    g.Country,
                    g.DateOfBirth,
                    g.PassportNumber,
                    g.Gender,
                    g.IsActive,
                    g.CreatedDate,
                    ReservationCount = g.Reservations.Count(r => r.IsActive)
                })
                .FirstOrDefaultAsync();

            if (guest == null)
            {
                return NotFound();
            }

            return guest;
        }

        // PUT: api/Guests/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGuest(int id, Guest guest)
        {
            if (id != guest.GuestId)
            {
                return BadRequest();
            }

            _context.Entry(guest).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GuestExists(id))
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

        // POST: api/Guests
        [HttpPost]
        public async Task<ActionResult<Guest>> PostGuest(Guest guest)
        {
            guest.CreatedDate = DateTime.UtcNow;
            guest.IsActive = true;

            _context.Guests.Add(guest);
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (EmailExists(guest.Email))
                {
                    return Conflict("Email already exists");
                }
                throw;
            }

            return CreatedAtAction("GetGuest", new { id = guest.GuestId }, guest);
        }

        // DELETE: api/Guests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGuest(int id)
        {
            var guest = await _context.Guests.FindAsync(id);
            if (guest == null)
            {
                return NotFound();
            }

            // Check if guest has active reservations
            var hasActiveReservations = await _context.Reservations
                .AnyAsync(r => r.GuestId == id && r.IsActive && r.Status != "Cancelled");

            if (hasActiveReservations)
            {
                return BadRequest("Cannot delete guest with active reservations");
            }

            // Soft delete
            guest.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Guests/Search?email=john@example.com
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Guest>>> SearchGuests(
            string? email = null,
            string? firstName = null,
            string? lastName = null,
            string? phone = null)
        {
            var query = _context.Guests
                .Where(g => g.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(email))
                query = query.Where(g => g.Email.ToLower().Contains(email.ToLower()));

            if (!string.IsNullOrEmpty(firstName))
                query = query.Where(g => g.FirstName.ToLower().Contains(firstName.ToLower()));

            if (!string.IsNullOrEmpty(lastName))
                query = query.Where(g => g.LastName.ToLower().Contains(lastName.ToLower()));

            if (!string.IsNullOrEmpty(phone))
                query = query.Where(g => g.Phone != null && g.Phone.Contains(phone));

            return await query.ToListAsync();
        }

        // GET: api/Guests/5/Reservations
        [HttpGet("{id}/reservations")]
        public async Task<ActionResult<IEnumerable<object>>> GetGuestReservations(int id)
        {
            var guest = await _context.Guests.FindAsync(id);
            if (guest == null || !guest.IsActive)
            {
                return NotFound();
            }

            var reservations = await _context.Reservations
                .Where(r => r.GuestId == id && r.IsActive)
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

            return reservations;
        }

        private bool GuestExists(int id)
        {
            return _context.Guests.Any(e => e.GuestId == id);
        }

        private bool EmailExists(string email)
        {
            return _context.Guests.Any(g => g.Email.ToLower() == email.ToLower());
        }
    }
}