using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementAPI.Data;
using HotelManagementAPI.Models;

namespace HotelManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelsController : ControllerBase
    {
        private readonly HotelManagementContext _context;

        public HotelsController(HotelManagementContext context)
        {
            _context = context;
        }

        // GET: api/Hotels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetHotels()
        {
            return await _context.Hotels
                .Where(h => h.IsActive)
                .Select(h => new
                {
                    h.HotelId,
                    h.Name,
                    h.Address,
                    h.City,
                    h.Country,
                    h.Phone,
                    h.Email,
                    h.StarRating,
                    h.Description,
                    h.IsActive,
                    h.CreatedDate,
                    RoomCount = h.Rooms.Count(r => r.IsActive)
                })
                .ToListAsync();
        }

        // GET: api/Hotels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetHotel(int id)
        {
            var hotel = await _context.Hotels
                .Where(h => h.HotelId == id && h.IsActive)
                .Select(h => new
                {
                    h.HotelId,
                    h.Name,
                    h.Address,
                    h.City,
                    h.Country,
                    h.Phone,
                    h.Email,
                    h.StarRating,
                    h.Description,
                    h.IsActive,
                    h.CreatedDate,
                    Rooms = h.Rooms.Where(r => r.IsActive).Select(r => new
                    {
                        r.RoomId,
                        r.RoomNumber,
                        r.RoomType,
                        r.Capacity,
                        r.PricePerNight,
                        r.Description,
                        r.HasWifi,
                        r.HasAC,
                        r.HasTV,
                        r.HasMinibar,
                        r.IsAvailable,
                        r.IsActive
                    })
                })
                .FirstOrDefaultAsync();

            if (hotel == null)
            {
                return NotFound();
            }

            return hotel;
        }

        // PUT: api/Hotels/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHotel(int id, Hotel hotel)
        {
            if (id != hotel.HotelId)
            {
                return BadRequest();
            }

            _context.Entry(hotel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HotelExists(id))
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

        // POST: api/Hotels
        [HttpPost]
        public async Task<ActionResult<Hotel>> PostHotel(Hotel hotel)
        {
            hotel.CreatedDate = DateTime.UtcNow;
            hotel.IsActive = true;

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHotel", new { id = hotel.HotelId }, hotel);
        }

        // DELETE: api/Hotels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null)
            {
                return NotFound();
            }

            // Soft delete
            hotel.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Hotels/5/Rooms
        [HttpGet("{id}/rooms")]
        public async Task<ActionResult<IEnumerable<object>>> GetHotelRooms(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null || !hotel.IsActive)
            {
                return NotFound();
            }

            var rooms = await _context.Rooms
                .Where(r => r.HotelId == id && r.IsActive)
                .Select(r => new
                {
                    r.RoomId,
                    r.RoomNumber,
                    r.HotelId,
                    r.RoomType,
                    r.Capacity,
                    r.PricePerNight,
                    r.Description,
                    r.HasWifi,
                    r.HasAC,
                    r.HasTV,
                    r.HasMinibar,
                    r.IsAvailable,
                    r.IsActive
                })
                .ToListAsync();

            return rooms;
        }

        // GET: api/Hotels/5/AvailableRooms?checkIn=2023-12-01&checkOut=2023-12-05
        [HttpGet("{id}/available-rooms")]
        public async Task<ActionResult<IEnumerable<object>>> GetAvailableRooms(int id, DateTime checkIn, DateTime checkOut)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null || !hotel.IsActive)
            {
                return NotFound();
            }

            var availableRooms = await _context.Rooms
                .Where(r => r.HotelId == id && r.IsActive && r.IsAvailable)
                .Where(r => !_context.Reservations.Any(res =>
                    res.RoomId == r.RoomId &&
                    res.IsActive &&
                    res.Status != "Cancelled" &&
                    res.CheckInDate < checkOut &&
                    res.CheckOutDate > checkIn))
                .Select(r => new
                {
                    r.RoomId,
                    r.RoomNumber,
                    r.HotelId,
                    r.RoomType,
                    r.Capacity,
                    r.PricePerNight,
                    r.Description,
                    r.HasWifi,
                    r.HasAC,
                    r.HasTV,
                    r.HasMinibar,
                    r.IsAvailable,
                    r.IsActive
                })
                .ToListAsync();

            return availableRooms;
        }

        private bool HotelExists(int id)
        {
            return _context.Hotels.Any(e => e.HotelId == id);
        }
    }
}