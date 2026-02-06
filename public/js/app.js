// API Base URL
const API_BASE = '/api';

// Token Management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// User Data Management
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// API Helper Functions
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const options = {
        method,
        headers
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Check
function checkAuth() {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Logout
function logout() {
    removeToken();
    removeUser();
    window.location.href = '/login.html';
}

// Role Switching
async function switchRole(newRole) {
    try {
        const data = await apiCall('/auth/switch-role', 'POST', { new_role: newRole });

        setToken(data.token);

        const user = getUser();
        user.current_role = newRole;
        setUser(user);

        // Redirect to appropriate dashboard
        if (newRole === 'donor') {
            window.location.href = '/donor-dashboard.html';
        } else if (newRole === 'receiver') {
            window.location.href = '/receiver-dashboard.html';
        } else if (newRole === 'staff') {
            window.location.href = '/staff-dashboard.html';
        } else if (newRole === 'admin') {
            window.location.href = '/admin-dashboard.html';
        }
    } catch (error) {
        showAlert('Failed to switch role: ' + error.message, 'danger');
    }
}

// Blood Type Badge
function getBloodTypeBadge(bloodType) {
    return `<span class="badge badge-blood-type">${bloodType}</span>`;
}

// Status Badge
function getStatusBadge(status) {
    const statusMap = {
        'pending': 'badge-status-pending',
        'allocated': 'badge-status-allocated',
        'crossmatch_passed': 'badge-status-allocated',
        'crossmatch_failed': 'badge-status-cancelled',
        'completed': 'badge-status-completed',
        'cancelled': 'badge-status-cancelled'
    };

    const badgeClass = statusMap[status] || 'badge-secondary';
    const displayText = status.replace(/_/g, ' ').toUpperCase();

    return `<span class="badge ${badgeClass}">${displayText}</span>`;
}

// Date Formatting
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show Alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Loading Spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border spinner-border-custom" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }
}

// Load Locations (Zillas and Thanas)
async function loadZillas(selectElementId) {
    try {
        const data = await apiCall('/locations/zillas', 'GET', null, false);
        const select = document.getElementById(selectElementId);

        if (select) {
            select.innerHTML = '<option value="">Select Zilla/District</option>';
            data.zillas.forEach(zilla => {
                const option = document.createElement('option');
                option.value = zilla.id;
                option.textContent = zilla.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load zillas:', error);
    }
}

async function loadThanas(zillaId, selectElementId) {
    try {
        const data = await apiCall(`/locations/thanas/${zillaId}`, 'GET', null, false);
        const select = document.getElementById(selectElementId);

        if (select) {
            select.innerHTML = '<option value="">Select Thana/Upazila</option>';
            data.thanas.forEach(thana => {
                const option = document.createElement('option');
                option.value = thana.id;
                option.textContent = thana.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load thanas:', error);
    }
}

// Update Navbar with User Info
function updateNavbar() {
    const user = getUser();
    if (!user) return;

    const navbarNav = document.querySelector('.navbar-nav');
    if (!navbarNav) return;

    // Add user info and logout button
    const userInfo = document.createElement('li');
    userInfo.className = 'nav-item dropdown';
    userInfo.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            👤 ${user.full_name}
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/profile.html">Profile Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
        </ul>
    `;
    navbarNav.appendChild(userInfo);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a protected page
    const protectedPages = ['donor-dashboard', 'receiver-dashboard', 'staff-dashboard', 'admin-dashboard', 'profile'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    if (protectedPages.includes(currentPage)) {
        checkAuth();
        updateNavbar();
    }
});
