// API Configuration and HTTP Client
class ApiClient {
    constructor() {
        this.baseUrl = window.location.origin + '/api';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: method.toUpperCase(),
            headers: this.headers
        };

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            showLoading(true);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            // Handle empty responses (like DELETE operations)
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error(`API Error (${method.toUpperCase()} ${endpoint}):`, error);
            showAlert('error', `Error: ${error.message}`);
            throw error;
        } finally {
            showLoading(false);
        }
    }

    // HTTP Methods
    async get(endpoint) {
        return this.request('GET', endpoint);
    }

    async post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    async put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    async delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

// Create global API client instance
const api = new ApiClient();

// Hotels API
const hotelsApi = {
    getAll: () => api.get('/hotels'),
    getById: (id) => api.get(`/hotels/${id}`),
    create: (hotel) => api.post('/hotels', hotel),
    update: (id, hotel) => api.put(`/hotels/${id}`, hotel),
    delete: (id) => api.delete(`/hotels/${id}`),
    getRooms: (id) => api.get(`/hotels/${id}/rooms`),
    getAvailableRooms: (id, checkIn, checkOut) => 
        api.get(`/hotels/${id}/available-rooms?checkIn=${checkIn}&checkOut=${checkOut}`)
};

// Rooms API
const roomsApi = {
    getAll: () => api.get('/rooms'),
    getById: (id) => api.get(`/rooms/${id}`),
    create: (room) => api.post('/rooms', room),
    update: (id, room) => api.put(`/rooms/${id}`, room),
    delete: (id) => api.delete(`/rooms/${id}`),
    search: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/rooms/search?${queryString}`);
    }
};

// Guests API
const guestsApi = {
    getAll: () => api.get('/guests'),
    getById: (id) => api.get(`/guests/${id}`),
    create: (guest) => api.post('/guests', guest),
    update: (id, guest) => api.put(`/guests/${id}`, guest),
    delete: (id) => api.delete(`/guests/${id}`),
    search: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/guests/search?${queryString}`);
    },
    getReservations: (id) => api.get(`/guests/${id}/reservations`)
};

// Reservations API
const reservationsApi = {
    getAll: () => api.get('/reservations'),
    getById: (id) => api.get(`/reservations/${id}`),
    create: (reservation) => api.post('/reservations', reservation),
    update: (id, reservation) => api.put(`/reservations/${id}`, reservation),
    delete: (id) => api.delete(`/reservations/${id}`),
    checkIn: (id) => api.post(`/reservations/${id}/checkin`),
    checkOut: (id) => api.post(`/reservations/${id}/checkout`),
    cancel: (id) => api.post(`/reservations/${id}/cancel`),
    search: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/reservations/search?${queryString}`);
    }
};

// Utility functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showAlert(type, message, duration = 5000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at the top of the main container
    const container = document.querySelector('.container');
    if (container && container.firstChild) {
        container.insertBefore(alertDiv, container.firstChild);
    }

    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }

    // Scroll to top to show the alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadge(status) {
    const statusClass = `status-${status.toLowerCase().replace(' ', '')}`;
    return `<span class="status-badge ${statusClass}">${status}</span>`;
}

function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-warning"></i>';
        } else {
            stars += '<i class="far fa-star text-muted"></i>';
        }
    }
    return stars;
}

function getAvailabilityStatus(isAvailable) {
    return isAvailable 
        ? '<span class="available"><i class="fas fa-check-circle"></i> Available</span>'
        : '<span class="unavailable"><i class="fas fa-times-circle"></i> Unavailable</span>';
}

// Validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidEmail(email) {
    return validateEmail(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    return phone === '' || phoneRegex.test(phone);
}

function validateDateRange(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
        return { valid: false, message: 'Check-in date cannot be in the past' };
    }

    if (checkOutDate <= checkInDate) {
        return { valid: false, message: 'Check-out date must be after check-in date' };
    }

    return { valid: true };
}

// Error handling
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    showAlert('error', 'An unexpected error occurred. Please try again.');
});

window.addEventListener('error', event => {
    console.error('JavaScript error:', event.error);
    showAlert('error', 'An unexpected error occurred. Please refresh the page.');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        api,
        hotelsApi,
        roomsApi,
        guestsApi,
        reservationsApi,
        showLoading,
        showAlert,
        formatCurrency,
        formatDate,
        formatDateTime,
        getStatusBadge,
        getStarRating,
        getAvailabilityStatus,
        validateEmail,
        validatePhone,
        validateDateRange
    };
}