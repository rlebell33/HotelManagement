using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementAPI.Data;
using HotelManagementAPI.Models;

namespace HotelManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly HotelManagementContext _context;

        public RoomsController(HotelManagementContext context)
        {
            _context = context;
        }

        // GET: api/Rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRooms()
        {
            return await _context.Rooms
                .Where(r => r.IsActive)
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
                    r.IsActive,
                    Hotel = new
                    {
                        r.Hotel.HotelId,
                        r.Hotel.Name,
                        r.Hotel.City,
                        r.Hotel.Country
                    }
                })
                .ToListAsync();
        }

        // GET: api/Rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Where(r => r.RoomId == id && r.IsActive)
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
                    r.IsActive,
                    Hotel = new
                    {
                        r.Hotel.HotelId,
                        r.Hotel.Name,
                        r.Hotel.Address,
                        r.Hotel.City,
                        r.Hotel.Country,
                        r.Hotel.StarRating
                    }
                })
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return NotFound();
            }

            return room;
        }

        // PUT: api/Rooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRoom(int id, Room room)
        {
            if (id != room.RoomId)
            {
                return BadRequest();
            }

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
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

        // POST: api/Rooms
        [HttpPost]
        public async Task<ActionResult<Room>> PostRoom(Room room)
        {
            // Validate hotel exists
            var hotel = await _context.Hotels.FindAsync(room.HotelId);
            if (hotel == null || !hotel.IsActive)
            {
                return BadRequest("Hotel not found or inactive");
            }

            room.CreatedDate = DateTime.UtcNow;
            room.IsActive = true;

            _context.Rooms.Add(room);
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RoomNumberExists(room.HotelId, room.RoomNumber))
                {
                    return Conflict("Room number already exists in this hotel");
                }
                throw;
            }

            return CreatedAtAction("GetRoom", new { id = room.RoomId }, room);
        }

        // DELETE: api/Rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            // Check if room has active reservations
            var hasActiveReservations = await _context.Reservations
                .AnyAsync(r => r.RoomId == id && r.IsActive && r.Status != "Cancelled");

            if (hasActiveReservations)
            {
                return BadRequest("Cannot delete room with active reservations");
            }

            // Soft delete
            room.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Rooms/Search?roomType=Double&minPrice=100&maxPrice=500
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchRooms(
            string? roomType = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? capacity = null,
            bool? hasWifi = null,
            bool? hasAC = null)
        {
            var query = _context.Rooms
                .Where(r => r.IsActive && r.IsAvailable)
                .AsQueryable();

            if (!string.IsNullOrEmpty(roomType))
                query = query.Where(r => r.RoomType.ToLower().Contains(roomType.ToLower()));

            if (minPrice.HasValue)
                query = query.Where(r => r.PricePerNight >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(r => r.PricePerNight <= maxPrice.Value);

            if (capacity.HasValue)
                query = query.Where(r => r.Capacity >= capacity.Value);

            if (hasWifi.HasValue)
                query = query.Where(r => r.HasWifi == hasWifi.Value);

            if (hasAC.HasValue)
                query = query.Where(r => r.HasAC == hasAC.Value);

            return await query.Select(r => new
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
                r.IsActive,
                Hotel = new
                {
                    r.Hotel.HotelId,
                    r.Hotel.Name,
                    r.Hotel.City,
                    r.Hotel.Country
                }
            }).ToListAsync();
        }

        private bool RoomExists(int id)
        {
            return _context.Rooms.Any(e => e.RoomId == id);
        }

        private bool RoomNumberExists(int hotelId, string roomNumber)
        {
            return _context.Rooms.Any(r => r.HotelId == hotelId && r.RoomNumber == roomNumber);
        }
    }
}