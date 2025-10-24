// Booking Management Functions

// Booking functions
async function loadBookingData() {
    try {
        const [hotels, guests] = await Promise.all([
            hotelsApi.getAll(),
            guestsApi.getAll()
        ]);

        // Populate hotel dropdown
        const hotelSelect = document.getElementById('booking-hotel');
        if (hotelSelect) {
            hotelSelect.innerHTML = '<option value="">Select Hotel</option>' +
                hotels.map(hotel => `<option value="${hotel.hotelId}">${hotel.name}</option>`).join('');
        }

        // Populate guest dropdown
        const guestSelect = document.getElementById('booking-guest');
        if (guestSelect) {
            guestSelect.innerHTML = '<option value="">Select Guest</option>' +
                guests.map(guest => `<option value="${guest.guestId}">${guest.firstName} ${guest.lastName}</option>`).join('');
        }
    } catch (error) {
        console.error('Failed to load booking data:', error);
    }
}

async function loadAvailableRooms() {
    const hotelId = document.getElementById('booking-hotel')?.value;
    const checkIn = document.getElementById('booking-checkin')?.value;
    const checkOut = document.getElementById('booking-checkout')?.value;
    const roomSelect = document.getElementById('booking-room');
    const totalInput = document.getElementById('booking-total');

    if (!roomSelect) return;

    // Reset room and total
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    if (totalInput) totalInput.value = '';

    if (!hotelId || !checkIn || !checkOut) {
        return;
    }

    // Validate dates first
    const dateValidation = validateDateRange(checkIn, checkOut);
    if (!dateValidation.valid) {
        showAlert('error', dateValidation.message);
        return;
    }

    try {
        showLoading(true);
        const rooms = await hotelsApi.getAvailableRooms(hotelId, checkIn, checkOut);
        
        if (rooms && rooms.length > 0) {
            roomSelect.innerHTML = '<option value="">Select Room</option>' +
                rooms.map(room => 
                    `<option value="${room.roomId}" data-price="${room.pricePerNight}">
                        ${room.roomNumber} - ${room.roomType} (${formatCurrency(room.pricePerNight)}/night) - ${room.capacity} guests
                    </option>`
                ).join('');
        } else {
            roomSelect.innerHTML = '<option value="">No rooms available for selected dates</option>';
            showAlert('warning', 'No rooms available for the selected dates');
        }
    } catch (error) {
        console.error('Failed to load available rooms:', error);
        showAlert('error', 'Failed to load available rooms. Please try again.');
        roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
    } finally {
        showLoading(false);
    }
}

function calculateTotal() {
    const checkIn = document.getElementById('booking-checkin')?.value;
    const checkOut = document.getElementById('booking-checkout')?.value;
    const roomSelect = document.getElementById('booking-room');
    const totalInput = document.getElementById('booking-total');

    if (!checkIn || !checkOut || !roomSelect?.value || !totalInput) return;

    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    const pricePerNight = parseFloat(selectedOption.getAttribute('data-price') || 0);
    
    if (pricePerNight > 0) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const total = nights * pricePerNight;
        
        totalInput.value = formatCurrency(total);
    }
}

async function handleBookingSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('booking-form');
    const formData = {
        guestId: parseInt(document.getElementById('booking-guest').value),
        roomId: parseInt(document.getElementById('booking-room').value),
        checkInDate: document.getElementById('booking-checkin').value,
        checkOutDate: document.getElementById('booking-checkout').value,
        numberOfGuests: parseInt(document.getElementById('booking-guests').value),
        amountPaid: parseFloat(document.getElementById('booking-paid').value || 0),
        specialRequests: document.getElementById('booking-requests').value.trim()
    };

    // Clear previous validation states
    form.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-invalid');
    });

    let isValid = true;

    // Validate required fields
    if (!formData.guestId) {
        document.getElementById('booking-guest').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.roomId) {
        document.getElementById('booking-room').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.checkInDate) {
        document.getElementById('booking-checkin').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.checkOutDate) {
        document.getElementById('booking-checkout').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
        document.getElementById('booking-guests').classList.add('is-invalid');
        isValid = false;
    }

    if (!isValid) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }

    // Validate dates
    const dateValidation = validateDateRange(formData.checkInDate, formData.checkOutDate);
    if (!dateValidation.valid) {
        showAlert('error', dateValidation.message);
        document.getElementById('booking-checkin').classList.add('is-invalid');
        document.getElementById('booking-checkout').classList.add('is-invalid');
        return;
    }

    try {
        showLoading(true);
        const newReservation = await reservationsApi.create(formData);
        showAlert('success', 'Reservation created successfully!');
        
        // Reset form
        document.getElementById('booking-form').reset();
        document.getElementById('booking-room').innerHTML = '<option value="">Select Room</option>';
        document.getElementById('booking-total').value = '';
        
        // Set default dates again
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('booking-checkin').value = today;
        document.getElementById('booking-checkout').value = tomorrowStr;
        
        // Refresh dashboard data
        await loadDashboardData();
        
        // Optionally switch to reservations view to show the new reservation
        showSection('reservations');
        
    } catch (error) {
        console.error('Failed to create reservation:', error);
        showAlert('error', `Failed to create reservation: ${error.message}`);
    } finally {
        showLoading(false);
    }
}