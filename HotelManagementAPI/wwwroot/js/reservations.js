// Reservation Management Functions

// Reservations functions
async function loadReservations() {
    try {
        const statusFilter = document.getElementById('status-filter')?.value || '';
        let reservations;
        
        if (statusFilter) {
            reservations = await reservationsApi.search({ status: statusFilter });
        } else {
            reservations = await reservationsApi.getAll();
        }
        
        currentData.reservations = reservations;
        displayReservations(reservations);
    } catch (error) {
        console.error('Failed to load reservations:', error);
    }
}

function displayReservations(reservations) {
    const tbody = document.querySelector('#reservations-table tbody');
    if (!tbody) return;

    tbody.innerHTML = reservations.map(reservation => `
        <tr>
            <td><strong>${reservation.guest?.firstName} ${reservation.guest?.lastName}</strong></td>
            <td>${reservation.room?.hotel?.name || 'N/A'}</td>
            <td>${reservation.room?.roomNumber}</td>
            <td>${formatDate(reservation.checkInDate)}</td>
            <td>${formatDate(reservation.checkOutDate)}</td>
            <td>${formatCurrency(reservation.totalAmount)}</td>
            <td>${getStatusBadge(reservation.status)}</td>
            <td>
                ${getReservationActions(reservation)}
            </td>
        </tr>
    `).join('');
}

function getReservationActions(reservation) {
    let actions = `
        <button class="btn btn-sm btn-primary" onclick="editReservation(${reservation.reservationId})">
            <i class="fas fa-edit"></i>
        </button>
    `;

    if (reservation.status === 'Confirmed') {
        actions += `
            <button class="btn btn-sm btn-success" onclick="checkInReservation(${reservation.reservationId})">
                <i class="fas fa-sign-in-alt"></i>
            </button>
        `;
    }

    if (reservation.status === 'CheckedIn') {
        actions += `
            <button class="btn btn-sm btn-info" onclick="checkOutReservation(${reservation.reservationId})">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
    }

    if (reservation.status !== 'CheckedOut' && reservation.status !== 'Cancelled') {
        actions += `
            <button class="btn btn-sm btn-warning" onclick="cancelReservation(${reservation.reservationId})">
                <i class="fas fa-ban"></i>
            </button>
        `;
    }

    actions += `
        <button class="btn btn-sm btn-danger" onclick="deleteReservation(${reservation.reservationId})">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return actions;
}

// Reservation edit functions
async function editReservation(id) {
    try {
        const reservation = await reservationsApi.getById(id);
        
        // Clear validation states
        clearFormValidation('editReservationForm');
        
        // Load dropdown data
        await Promise.all([
            loadGuestsForDropdown('editReservationGuest'),
            loadHotelsForDropdown('editReservationHotel')
        ]);
        
        // Populate the edit form
        document.getElementById('editReservationId').value = reservation.reservationId;
        document.getElementById('editReservationGuest').value = reservation.guestId;
        document.getElementById('editReservationHotel').value = reservation.room.hotel.hotelId;
        document.getElementById('editReservationCheckIn').value = reservation.checkInDate.split('T')[0];
        document.getElementById('editReservationCheckOut').value = reservation.checkOutDate.split('T')[0];
        document.getElementById('editReservationGuests').value = reservation.numberOfGuests;
        document.getElementById('editReservationTotal').value = formatCurrency(reservation.totalAmount);
        document.getElementById('editReservationPaid').value = reservation.amountPaid || 0;
        document.getElementById('editReservationStatus').value = reservation.status;
        document.getElementById('editReservationRequests').value = reservation.specialRequests || '';
        
        // Load available rooms for the selected hotel and dates
        await loadEditAvailableRooms();
        document.getElementById('editReservationRoom').value = reservation.roomId;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editReservationModal'));
        modal.show();
    } catch (error) {
        console.error('Failed to load reservation:', error);
        showAlert('error', 'Failed to load reservation data');
    }
}

async function updateReservation() {
    try {
        const id = document.getElementById('editReservationId').value;
        const reservation = {
            reservationId: parseInt(id),
            guestId: parseInt(document.getElementById('editReservationGuest').value),
            roomId: parseInt(document.getElementById('editReservationRoom').value),
            checkInDate: document.getElementById('editReservationCheckIn').value,
            checkOutDate: document.getElementById('editReservationCheckOut').value,
            numberOfGuests: parseInt(document.getElementById('editReservationGuests').value),
            totalAmount: parseFloat(document.getElementById('editReservationTotal').value.replace('$', '').replace(',', '')),
            amountPaid: parseFloat(document.getElementById('editReservationPaid').value) || 0,
            status: document.getElementById('editReservationStatus').value,
            specialRequests: document.getElementById('editReservationRequests').value
        };

        await reservationsApi.update(id, reservation);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editReservationModal'));
        modal.hide();
        
        // Reload reservations
        await loadReservations();
        showAlert('success', 'Reservation updated successfully!');
    } catch (error) {
        console.error('Failed to update reservation:', error);
        showAlert('error', 'Failed to update reservation. Please try again.');
    }
}

// Helper functions for edit modals
async function loadEditAvailableRooms() {
    const hotelId = document.getElementById('editReservationHotel').value;
    const checkIn = document.getElementById('editReservationCheckIn').value;
    const checkOut = document.getElementById('editReservationCheckOut').value;
    
    if (!hotelId || !checkIn || !checkOut) return;
    
    try {
        const rooms = await hotelsApi.getAvailableRooms(hotelId, checkIn, checkOut);
        const select = document.getElementById('editReservationRoom');
        
        select.innerHTML = '<option value="">Select Room</option>' + 
            rooms.map(room => 
                `<option value="${room.roomId}">${room.roomNumber} - ${room.roomType} (${formatCurrency(room.pricePerNight)}/night)</option>`
            ).join('');
    } catch (error) {
        console.error('Failed to load available rooms:', error);
    }
}

async function calculateEditTotal() {
    const checkIn = document.getElementById('editReservationCheckIn').value;
    const checkOut = document.getElementById('editReservationCheckOut').value;
    const roomSelect = document.getElementById('editReservationRoom');
    
    if (!checkIn || !checkOut || !roomSelect.value) return;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return;
    
    try {
        const room = await roomsApi.getById(roomSelect.value);
        const total = room.pricePerNight * nights;
        document.getElementById('editReservationTotal').value = formatCurrency(total);
    } catch (error) {
        console.error('Failed to calculate total:', error);
    }
}

// Action functions
async function checkInReservation(id) {
    if (confirm('Are you sure you want to check in this guest?')) {
        try {
            await reservationsApi.checkIn(id);
            showAlert('success', 'Guest checked in successfully!');
            await loadReservations();
        } catch (error) {
            console.error('Failed to check in:', error);
        }
    }
}

async function checkOutReservation(id) {
    if (confirm('Are you sure you want to check out this guest?')) {
        try {
            await reservationsApi.checkOut(id);
            showAlert('success', 'Guest checked out successfully!');
            await loadReservations();
        } catch (error) {
            console.error('Failed to check out:', error);
        }
    }
}

async function cancelReservation(id) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
        try {
            await reservationsApi.cancel(id);
            showAlert('success', 'Reservation cancelled successfully!');
            await loadReservations();
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
        }
    }
}

async function deleteReservation(id) {
    if (confirm('Are you sure you want to delete this reservation?')) {
        try {
            await reservationsApi.delete(id);
            showAlert('success', 'Reservation deleted successfully!');
            await loadReservations();
        } catch (error) {
            console.error('Failed to delete reservation:', error);
        }
    }
}