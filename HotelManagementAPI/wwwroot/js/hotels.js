// Hotel Management Functions

// Hotels functions
async function loadHotels() {
    try {
        const hotels = await hotelsApi.getAll();
        currentData.hotels = hotels;
        displayHotels(hotels);
    } catch (error) {
        console.error('Failed to load hotels:', error);
    }
}

function displayHotels(hotels) {
    const tbody = document.querySelector('#hotels-table tbody');
    if (!tbody) return;

    tbody.innerHTML = hotels.map(hotel => `
        <tr>
            <td><strong>${hotel.name}</strong></td>
            <td>${hotel.city}</td>
            <td>${hotel.country}</td>
            <td>${getStarRating(hotel.starRating)}</td>
            <td>${hotel.email || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editHotel(${hotel.hotelId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewHotelRooms(${hotel.hotelId})">
                    <i class="fas fa-bed"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteHotel(${hotel.hotelId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Hotel modal functions
function showAddHotelModal() {
    // Reset form and clear validation
    document.getElementById('addHotelForm').reset();
    clearFormValidation('addHotelForm');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addHotelModal'));
    modal.show();
}

async function createHotel() {
    const form = document.getElementById('addHotelForm');
    const formData = {
        name: document.getElementById('hotelName').value.trim(),
        address: document.getElementById('hotelAddress').value.trim(),
        city: document.getElementById('hotelCity').value.trim(),
        state: document.getElementById('hotelState').value.trim(),
        country: document.getElementById('hotelCountry').value.trim(),
        phone: document.getElementById('hotelPhone').value.trim(),
        email: document.getElementById('hotelEmail').value.trim(),
        starRating: parseInt(document.getElementById('hotelStars').value),
        description: document.getElementById('hotelDescription').value.trim()
    };

    // Clear previous validation states
    form.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-invalid');
    });

    let isValid = true;

    // Validation
    if (!formData.name) {
        document.getElementById('hotelName').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.address) {
        document.getElementById('hotelAddress').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.city) {
        document.getElementById('hotelCity').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.country) {
        document.getElementById('hotelCountry').classList.add('is-invalid');
        isValid = false;
    }

    if (!formData.starRating) {
        document.getElementById('hotelStars').classList.add('is-invalid');
        isValid = false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
        document.getElementById('hotelEmail').classList.add('is-invalid');
        showAlert('error', 'Please enter a valid email address');
        isValid = false;
    }

    if (!isValid) {
        showAlert('error', 'Please fill in all required fields correctly');
        return;
    }

    try {
        await hotelsApi.create(formData);
        showAlert('success', 'Hotel created successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addHotelModal'));
        modal.hide();
        
        // Refresh hotels list if on hotels page
        if (currentSection === 'hotels') {
            await loadHotels();
        }
        
        // Refresh dashboard
        await loadDashboardData();
    } catch (error) {
        console.error('Failed to create hotel:', error);
        showAlert('error', 'Failed to create hotel. Please try again.');
    }
}

async function editHotel(id) {
    try {
        const hotel = await hotelsApi.getById(id);
        
        // Clear validation states
        clearFormValidation('editHotelForm');
        
        // Populate the edit form
        document.getElementById('editHotelId').value = hotel.hotelId;
        document.getElementById('editHotelName').value = hotel.name;
        document.getElementById('editHotelStars').value = hotel.starRating;
        document.getElementById('editHotelAddress').value = hotel.address || '';
        document.getElementById('editHotelCity').value = hotel.city;
        document.getElementById('editHotelState').value = hotel.state || '';
        document.getElementById('editHotelCountry').value = hotel.country;
        document.getElementById('editHotelPhone').value = hotel.phone || '';
        document.getElementById('editHotelEmail').value = hotel.email || '';
        document.getElementById('editHotelDescription').value = hotel.description || '';
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editHotelModal'));
        modal.show();
    } catch (error) {
        console.error('Failed to load hotel:', error);
        showAlert('error', 'Failed to load hotel data');
    }
}

async function updateHotel() {
    try {
        const id = document.getElementById('editHotelId').value;
        const hotel = {
            hotelId: parseInt(id),
            name: document.getElementById('editHotelName').value,
            starRating: parseInt(document.getElementById('editHotelStars').value),
            address: document.getElementById('editHotelAddress').value,
            city: document.getElementById('editHotelCity').value,
            state: document.getElementById('editHotelState').value,
            country: document.getElementById('editHotelCountry').value,
            phone: document.getElementById('editHotelPhone').value,
            email: document.getElementById('editHotelEmail').value,
            description: document.getElementById('editHotelDescription').value
        };

        await hotelsApi.update(id, hotel);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editHotelModal'));
        modal.hide();
        
        // Reload hotels
        await loadHotels();
        showAlert('success', 'Hotel updated successfully!');
    } catch (error) {
        console.error('Failed to update hotel:', error);
        showAlert('error', 'Failed to update hotel. Please try again.');
    }
}

function deleteHotel(id) {
    if (confirm('Are you sure you want to delete this hotel?')) {
        showAlert('info', `Delete Hotel ${id} - To be implemented`);
    }
}

function viewHotelRooms(hotelId) {
    showAlert('info', `View Hotel ${hotelId} Rooms - To be implemented`);
}

// Helper function to load hotels for dropdowns
async function loadHotelsForDropdown(selectId) {
    try {
        const hotels = await hotelsApi.getAll();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Hotel</option>' +
                hotels.map(hotel => `<option value="${hotel.hotelId}">${hotel.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Failed to load hotels for dropdown:', error);
    }
}