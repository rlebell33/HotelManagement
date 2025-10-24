// Room Management Functions

// Rooms functions
async function loadRooms() {
    try {
        const rooms = await roomsApi.getAll();
        currentData.rooms = rooms;
        displayRooms(rooms);
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

function displayRooms(rooms) {
    const tbody = document.querySelector('#rooms-table tbody');
    if (!tbody) return;

    tbody.innerHTML = rooms.map(room => `
        <tr>
            <td><strong>${room.roomNumber}</strong></td>
            <td>${room.hotel?.name || 'N/A'}</td>
            <td>${room.roomType}</td>
            <td>${room.capacity}</td>
            <td>${formatCurrency(room.pricePerNight)}</td>
            <td>${getAvailabilityStatus(room.isAvailable)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editRoom(${room.roomId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.roomId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Room modal functions
async function showAddRoomModal() {
    // Reset form and clear validation
    document.getElementById('addRoomForm').reset();
    clearFormValidation('addRoomForm');
    
    // Load hotels for dropdown
    try {
        const hotels = await hotelsApi.getAll();
        const hotelSelect = document.getElementById('roomHotel');
        hotelSelect.innerHTML = '<option value="">Select Hotel</option>' +
            hotels.map(hotel => `<option value="${hotel.hotelId}">${hotel.name}</option>`).join('');
    } catch (error) {
        console.error('Failed to load hotels for room modal:', error);
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
    modal.show();
}

async function createRoom() {
    const amenitiesText = document.getElementById('roomAmenities').value.trim().toLowerCase();
    
    const formData = {
        hotelId: parseInt(document.getElementById('roomHotel').value),
        roomNumber: document.getElementById('roomNumber').value.trim(),
        roomType: document.getElementById('roomType').value,
        capacity: parseInt(document.getElementById('roomCapacity').value),
        pricePerNight: parseFloat(document.getElementById('roomPrice').value),
        isAvailable: document.getElementById('roomStatus').value === 'Available',
        hasWifi: amenitiesText.includes('wifi'),
        hasAC: amenitiesText.includes('air conditioning') || amenitiesText.includes('ac'),
        hasTV: amenitiesText.includes('tv'),
        hasMinibar: amenitiesText.includes('mini bar') || amenitiesText.includes('minibar')
    };

    // Validation
    if (!formData.hotelId || !formData.roomNumber || !formData.roomType || !formData.capacity || !formData.pricePerNight) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }

    if (formData.capacity < 1 || formData.capacity > 10) {
        showAlert('error', 'Room capacity must be between 1 and 10');
        return;
    }

    if (formData.pricePerNight < 0) {
        showAlert('error', 'Price per night must be a positive number');
        return;
    }

    try {
        await roomsApi.create(formData);
        showAlert('success', 'Room created successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
        modal.hide();
        
        // Refresh rooms list if on rooms page
        if (currentSection === 'rooms') {
            await loadRooms();
        }
        
        // Refresh dashboard
        await loadDashboardData();
    } catch (error) {
        console.error('Failed to create room:', error);
        showAlert('error', 'Failed to create room. Please try again.');
    }
}

async function editRoom(id) {
    try {
        const room = await roomsApi.getById(id);
        
        // Clear validation states
        clearFormValidation('editRoomForm');
        
        // Load hotels for dropdown
        await loadHotelsForDropdown('editRoomHotel');
        
        // Populate the edit form
        document.getElementById('editRoomId').value = room.roomId;
        document.getElementById('editRoomHotel').value = room.hotelId;
        document.getElementById('editRoomNumber').value = room.roomNumber;
        document.getElementById('editRoomType').value = room.roomType;
        document.getElementById('editRoomCapacity').value = room.capacity;
        document.getElementById('editRoomPrice').value = room.pricePerNight;
        document.getElementById('editRoomStatus').value = room.isAvailable.toString();
        
        // Build amenities string from boolean fields
        const amenities = [];
        if (room.hasWifi) amenities.push('WiFi');
        if (room.hasAC) amenities.push('Air Conditioning');
        if (room.hasTV) amenities.push('TV');
        if (room.hasMinibar) amenities.push('Mini Bar');
        document.getElementById('editRoomAmenities').value = amenities.join(', ');
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editRoomModal'));
        modal.show();
    } catch (error) {
        console.error('Failed to load room:', error);
        showAlert('error', 'Failed to load room data');
    }
}

async function updateRoom() {
    try {
        const id = document.getElementById('editRoomId').value;
        const amenitiesText = document.getElementById('editRoomAmenities').value.toLowerCase();
        
        const room = {
            roomId: parseInt(id),
            hotelId: parseInt(document.getElementById('editRoomHotel').value),
            roomNumber: document.getElementById('editRoomNumber').value,
            roomType: document.getElementById('editRoomType').value,
            capacity: parseInt(document.getElementById('editRoomCapacity').value),
            pricePerNight: parseFloat(document.getElementById('editRoomPrice').value),
            isAvailable: document.getElementById('editRoomStatus').value === 'true',
            hasWifi: amenitiesText.includes('wifi'),
            hasAC: amenitiesText.includes('air conditioning') || amenitiesText.includes('ac'),
            hasTV: amenitiesText.includes('tv'),
            hasMinibar: amenitiesText.includes('mini bar') || amenitiesText.includes('minibar')
        };

        await roomsApi.update(id, room);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRoomModal'));
        modal.hide();
        
        // Reload rooms
        await loadRooms();
        showAlert('success', 'Room updated successfully!');
    } catch (error) {
        console.error('Failed to update room:', error);
        showAlert('error', 'Failed to update room. Please try again.');
    }
}

function deleteRoom(id) {
    if (confirm('Are you sure you want to delete this room?')) {
        showAlert('info', `Delete Room ${id} - To be implemented`);
    }
}