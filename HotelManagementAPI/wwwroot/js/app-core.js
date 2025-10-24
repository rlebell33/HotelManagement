// Core Application Logic - Main entry point
let currentSection = 'dashboard';
let currentData = {
    hotels: [],
    rooms: [],
    guests: [],
    reservations: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Load initial data and show dashboard
        await loadDashboardData();
        setupEventListeners();
        showSection('dashboard');
        
        showAlert('success', 'Hotel Management System loaded successfully!', 3000);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showAlert('error', 'Failed to load application. Please refresh the page.');
    }
}

function setupEventListeners() {
    // Booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Navigation - Simple show/hide sections (original working approach)
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        currentSection = sectionName;
    }

    // Load section data - delegates to module-specific functions
    switch (sectionName) {
        case 'dashboard':
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            break;
        case 'hotels':
            if (typeof loadHotels === 'function') {
                loadHotels(); // From hotels.js
            }
            break;
        case 'rooms':
            if (typeof loadRooms === 'function') {
                loadRooms(); // From rooms.js
            }
            break;
        case 'guests':
            if (typeof loadGuests === 'function') {
                loadGuests(); // From guests.js
            }
            break;
        case 'reservations':
            if (typeof loadReservations === 'function') {
                loadReservations(); // From reservations.js
            }
            break;
        case 'booking':
            // Initialize booking form dates after template is loaded
            initializeBookingForm();
            if (typeof loadBookingData === 'function') {
                loadBookingData(); // From booking.js
            }
            break;
    }
}

// Booking form initialization - Set default dates after template loads
function initializeBookingForm() {
    // Set default check-in date to today
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const checkInInput = document.getElementById('booking-checkin');
    const checkOutInput = document.getElementById('booking-checkout');
    
    if (checkInInput) checkInInput.value = today;
    if (checkOutInput) checkOutInput.value = tomorrowStr;
}

// Dashboard functions - Core dashboard data loading
async function loadDashboardData() {
    try {
        const [hotels, rooms, guests, reservations] = await Promise.all([
            hotelsApi.getAll(),
            roomsApi.getAll(),
            guestsApi.getAll(),
            reservationsApi.getAll()
        ]);

        currentData = { hotels, rooms, guests, reservations };

        // Update dashboard counters
        document.getElementById('total-hotels').textContent = hotels.length;
        document.getElementById('total-rooms').textContent = rooms.length;
        document.getElementById('total-guests').textContent = guests.length;
        document.getElementById('active-reservations').textContent = 
            reservations.filter(r => r.status === 'Confirmed' || r.status === 'CheckedIn').length;

        // Load recent reservations - delegates to utils.js
        loadRecentReservations(reservations.slice(0, 10));
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Global alert system
function showAlert(type, message, timeout = 5000) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert-custom');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show alert-custom`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);

    // Auto-remove after timeout
    if (timeout > 0) {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, timeout);
    }
}