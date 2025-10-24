// Utility Functions

// Utility function to clear form validation states
function clearFormValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Remove validation classes from all form controls
    form.querySelectorAll('.form-control, .form-select').forEach(element => {
        element.classList.remove('is-valid', 'is-invalid');
    });
    
    // Hide all validation feedback
    form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(element => {
        element.style.display = 'none';
    });
}

// Dashboard functions
function loadRecentReservations(reservations) {
    const tbody = document.querySelector('#recent-reservations-table tbody');
    if (!tbody) return;

    tbody.innerHTML = reservations.map(reservation => `
        <tr>
            <td>${reservation.guest?.firstName} ${reservation.guest?.lastName}</td>
            <td>${reservation.room?.hotel?.name || 'N/A'}</td>
            <td>${reservation.room?.roomNumber}</td>
            <td>${formatDate(reservation.checkInDate)}</td>
            <td>${formatDate(reservation.checkOutDate)}</td>
            <td>${getStatusBadge(reservation.status)}</td>
        </tr>
    `).join('');
}