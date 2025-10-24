// Guest Management Functions

// Guests functions
async function loadGuests() {
    try {
        const guests = await guestsApi.getAll();
        currentData.guests = guests;
        displayGuests(guests);
    } catch (error) {
        console.error('Failed to load guests:', error);
    }
}

function displayGuests(guests) {
    const tbody = document.querySelector('#guests-table tbody');
    if (!tbody) return;

    tbody.innerHTML = guests.map(guest => `
        <tr>
            <td><strong>${guest.firstName} ${guest.lastName}</strong></td>
            <td>${guest.email}</td>
            <td>${guest.phone || 'N/A'}</td>
            <td>${guest.city || 'N/A'}</td>
            <td>${guest.country || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editGuest(${guest.guestId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewGuestReservations(${guest.guestId})">
                    <i class="fas fa-calendar"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteGuest(${guest.guestId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Guest modal functions
function showAddGuestModal() {
    // Reset form and clear validation
    document.getElementById('addGuestForm').reset();
    clearFormValidation('addGuestForm');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addGuestModal'));
    modal.show();
}

async function createGuest() {
    const formData = {
        firstName: document.getElementById('guestFirstName').value.trim(),
        lastName: document.getElementById('guestLastName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        phone: document.getElementById('guestPhone').value.trim(),
        dateOfBirth: document.getElementById('guestDateOfBirth').value || null,
        nationality: document.getElementById('guestNationality').value.trim(),
        address: document.getElementById('guestAddress').value.trim(),
        city: document.getElementById('guestCity').value.trim(),
        state: document.getElementById('guestState').value.trim(),
        country: document.getElementById('guestCountry').value.trim(),
        passportNumber: document.getElementById('guestPassport').value.trim(),
        preferences: document.getElementById('guestPreferences').value.trim()
    };

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }

    if (!isValidEmail(formData.email)) {
        showAlert('error', 'Please enter a valid email address');
        return;
    }

    // Validate date of birth if provided
    if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 150) {
            showAlert('error', 'Please enter a valid date of birth');
            return;
        }
    }

    try {
        await guestsApi.create(formData);
        showAlert('success', 'Guest created successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGuestModal'));
        modal.hide();
        
        // Refresh guests list if on guests page
        if (currentSection === 'guests') {
            await loadGuests();
        }
        
        // Refresh dashboard
        await loadDashboardData();
    } catch (error) {
        console.error('Failed to create guest:', error);
        showAlert('error', 'Failed to create guest. Please try again.');
    }
}

async function editGuest(id) {
    try {
        const guest = await guestsApi.getById(id);
        
        // Clear validation states
        clearFormValidation('editGuestForm');
        
        // Populate the edit form
        document.getElementById('editGuestId').value = guest.guestId;
        document.getElementById('editGuestFirstName').value = guest.firstName;
        document.getElementById('editGuestLastName').value = guest.lastName;
        document.getElementById('editGuestEmail').value = guest.email;
        document.getElementById('editGuestPhone').value = guest.phone || '';
        document.getElementById('editGuestDateOfBirth').value = guest.dateOfBirth ? guest.dateOfBirth.split('T')[0] : '';
        document.getElementById('editGuestNationality').value = ''; // Field not in model
        document.getElementById('editGuestAddress').value = guest.address || '';
        document.getElementById('editGuestCity').value = guest.city || '';
        document.getElementById('editGuestState').value = ''; // Field not in model
        document.getElementById('editGuestCountry').value = guest.country || '';
        document.getElementById('editGuestPassport').value = guest.passportNumber || '';
        document.getElementById('editGuestPreferences').value = ''; // Field not in model
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editGuestModal'));
        modal.show();
    } catch (error) {
        console.error('Failed to load guest:', error);
        showAlert('error', 'Failed to load guest data');
    }
}

async function updateGuest() {
    try {
        const id = document.getElementById('editGuestId').value;
        const guest = {
            guestId: parseInt(id),
            firstName: document.getElementById('editGuestFirstName').value,
            lastName: document.getElementById('editGuestLastName').value,
            email: document.getElementById('editGuestEmail').value,
            phone: document.getElementById('editGuestPhone').value,
            dateOfBirth: document.getElementById('editGuestDateOfBirth').value || null,
            address: document.getElementById('editGuestAddress').value,
            city: document.getElementById('editGuestCity').value,
            country: document.getElementById('editGuestCountry').value,
            passportNumber: document.getElementById('editGuestPassport').value
            // Removed: nationality, state, preferences - these fields don't exist in the Guest model
        };

        await guestsApi.update(id, guest);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGuestModal'));
        modal.hide();
        
        // Reload guests
        await loadGuests();
        showAlert('success', 'Guest updated successfully!');
    } catch (error) {
        console.error('Failed to update guest:', error);
        showAlert('error', 'Failed to update guest. Please try again.');
    }
}

function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest?')) {
        showAlert('info', `Delete Guest ${id} - To be implemented`);
    }
}

function viewGuestReservations(guestId) {
    showAlert('info', `View Guest ${guestId} Reservations - To be implemented`);
}

// Helper function to load guests for dropdowns
async function loadGuestsForDropdown(selectId) {
    try {
        const guests = await guestsApi.getAll();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Guest</option>' +
                guests.map(guest => `<option value="${guest.guestId}">${guest.firstName} ${guest.lastName}</option>`).join('');
        }
    } catch (error) {
        console.error('Failed to load guests for dropdown:', error);
    }
}