const SUPABASE_URL = 'https://xklttbborrdoettifjak.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrbHR0YmJvcnJkb2V0dGlmamFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzQ3ODIsImV4cCI6MjA4NjExMDc4Mn0.iJIs2lgGF0fCL8CqrUMg1n4FaJ55adwK5HLk7ooxb4M';
const ADMIN_PASSWORD = 'Erik0511';

let bookings = [];
let adminCalendarStart = getAdminMonday(new Date());

// ========== AUTH ==========

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuth', 'true');
        showDashboard();
    } else {
        document.getElementById('loginError').textContent = 'Fel lösenord';
    }
}

function handleLogout() {
    sessionStorage.removeItem('adminAuth');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('loginError').textContent = '';
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadBookings();
}

// ========== DATA ==========

async function loadBookings() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?order=booking_date.desc,booking_time.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        bookings = await res.json();
        renderStats();
        filterBookings();
        renderAdminCalendar();
    } catch (err) {
        console.error('Failed to load bookings:', err);
    }
}

async function updateBookingStatus(id, status) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ status })
        });
        await loadBookings();
        closeDetail();
    } catch (err) {
        console.error('Failed to update booking:', err);
    }
}

async function deleteBooking(id) {
    if (!confirm('Är du säker på att du vill ta bort denna bokning?')) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        await loadBookings();
        closeDetail();
    } catch (err) {
        console.error('Failed to delete booking:', err);
    }
}

// ========== STATS ==========

function renderStats() {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;

    document.getElementById('adminStats').innerHTML = `
        <div class="admin-stat-card">
            <span class="admin-stat-number">${total}</span>
            <span class="admin-stat-label">Totalt</span>
        </div>
        <div class="admin-stat-card pending">
            <span class="admin-stat-number">${pending}</span>
            <span class="admin-stat-label">Väntande</span>
        </div>
        <div class="admin-stat-card confirmed">
            <span class="admin-stat-number">${confirmed}</span>
            <span class="admin-stat-label">Bekräftade</span>
        </div>
        <div class="admin-stat-card completed">
            <span class="admin-stat-number">${completed}</span>
            <span class="admin-stat-label">Avklarade</span>
        </div>
    `;
}

// ========== LIST VIEW ==========

function filterBookings() {
    const filter = document.getElementById('statusFilter').value;
    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('bookingsTableBody');
    const empty = document.getElementById('emptyState');

    if (data.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    tbody.innerHTML = data.map(b => `
        <tr onclick="openDetail('${b.id}')">
            <td>
                <span class="table-date">${formatDate(b.booking_date)}</span>
                <span class="table-time">${b.booking_time}</span>
            </td>
            <td>
                <span class="table-name">${escapeHtml(b.name)}</span>
                <span class="table-email">${escapeHtml(b.email)}</span>
            </td>
            <td>${escapeHtml(b.company || '—')}</td>
            <td>${getBusinessLabel(b.business_type)}</td>
            <td><span class="status-badge ${b.status}">${getStatusLabel(b.status)}</span></td>
            <td>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </td>
        </tr>
    `).join('');
}

// ========== CALENDAR VIEW ==========

function getAdminMonday(d) {
    d = new Date(d);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
}

function adminPrevWeek() {
    adminCalendarStart.setDate(adminCalendarStart.getDate() - 7);
    renderAdminCalendar();
}

function adminNextWeek() {
    adminCalendarStart.setDate(adminCalendarStart.getDate() + 7);
    renderAdminCalendar();
}

function renderAdminCalendar() {
    const grid = document.getElementById('adminCalendarGrid');
    const title = document.getElementById('adminCalendarTitle');

    const endOfWeek = new Date(adminCalendarStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const startMonth = adminCalendarStart.toLocaleDateString('sv-SE', { month: 'long' });
    const endMonth = endOfWeek.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
    title.textContent = startMonth === endMonth.split(' ')[0]
        ? `${adminCalendarStart.getDate()} – ${endOfWeek.getDate()} ${endMonth}`
        : `${adminCalendarStart.getDate()} ${startMonth} – ${endOfWeek.getDate()} ${endMonth}`;

    const timeSlots = [];
    for (let h = 8; h <= 17; h++) {
        timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
        if (h < 17) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    timeSlots.push('17:30');

    const days = [];
    const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    for (let i = 0; i < 7; i++) {
        const d = new Date(adminCalendarStart);
        d.setDate(d.getDate() + i);
        days.push(d);
    }

    let html = '<div class="cal-header-row"><div class="cal-time-label"></div>';
    days.forEach((d, i) => {
        const isToday = d.toDateString() === new Date().toDateString();
        html += `<div class="cal-day-header ${isToday ? 'today' : ''}">${dayNames[i]}<br><span>${d.getDate()}</span></div>`;
    });
    html += '</div>';

    html += '<div class="cal-body">';
    timeSlots.forEach(time => {
        html += `<div class="cal-row">`;
        html += `<div class="cal-time-label">${time}</div>`;
        days.forEach(d => {
            const dateStr = d.toISOString().split('T')[0];
            const booking = bookings.find(b => b.booking_date === dateStr && b.booking_time === time);
            if (booking) {
                html += `<div class="cal-cell booked ${booking.status}" onclick="openDetail('${booking.id}')">
                    <span class="cal-booking-name">${escapeHtml(booking.name)}</span>
                </div>`;
            } else {
                html += `<div class="cal-cell"></div>`;
            }
        });
        html += `</div>`;
    });
    html += '</div>';

    grid.innerHTML = html;
}

function switchView(view) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));

    if (view === 'list') {
        document.getElementById('listView').classList.add('active');
        document.getElementById('viewTitle').textContent = 'Bokningar';
        document.getElementById('viewSubtitle').textContent = 'Alla inkomna bokningar';
    } else {
        document.getElementById('calendarView').classList.add('active');
        document.getElementById('viewTitle').textContent = 'Kalender';
        document.getElementById('viewSubtitle').textContent = 'Veckovis översikt av ditt schema';
        renderAdminCalendar();
    }
}

// ========== DETAIL MODAL ==========

function openDetail(id) {
    const b = bookings.find(x => x.id === id);
    if (!b) return;

    const goalsMap = {
        customers: 'Få fler kunder',
        professional: 'Se professionell ut',
        showcase: 'Visa upp mitt arbete',
        booking: 'Ta emot bokningar',
        google: 'Synas på Google',
        sell: 'Sälja produkter online'
    };

    const goals = (b.goals || []).map(g => goalsMap[g] || g).join(', ') || '—';

    document.getElementById('detailContent').innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Namn</span>
                <span class="detail-value">${escapeHtml(b.name)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value"><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Telefon</span>
                <span class="detail-value">${b.phone ? `<a href="tel:${escapeHtml(b.phone)}">${escapeHtml(b.phone)}</a>` : '—'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Företag</span>
                <span class="detail-value">${escapeHtml(b.company || '—')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Verksamhetstyp</span>
                <span class="detail-value">${getBusinessLabel(b.business_type)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Har hemsida</span>
                <span class="detail-value">${getWebsiteLabel(b.has_website)}</span>
            </div>
            <div class="detail-item full">
                <span class="detail-label">Mål</span>
                <span class="detail-value">${goals}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Bokad tid</span>
                <span class="detail-value">${formatDate(b.booking_date)} kl ${b.booking_time}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value"><span class="status-badge ${b.status}">${getStatusLabel(b.status)}</span></span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Skapad</span>
                <span class="detail-value">${new Date(b.created_at).toLocaleString('sv-SE')}</span>
            </div>
        </div>
    `;

    let actions = '';
    if (b.status === 'pending') {
        actions = `<button class="btn btn-primary" onclick="updateBookingStatus('${b.id}', 'confirmed')">Bekräfta bokning</button>`;
    } else if (b.status === 'confirmed') {
        actions = `<button class="btn btn-primary" onclick="updateBookingStatus('${b.id}', 'completed')">Markera som avklarad</button>`;
    }
    actions += `<button class="btn btn-danger" onclick="deleteBooking('${b.id}')">Ta bort</button>`;

    document.getElementById('detailActions').innerHTML = actions;

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetail() {
    document.getElementById('detailModal').classList.add('hidden');
}

// ========== HELPERS ==========

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getStatusLabel(status) {
    const map = { pending: 'Väntande', confirmed: 'Bekräftad', completed: 'Avklarad' };
    return map[status] || status;
}

function getBusinessLabel(type) {
    const map = {
        frisor: 'Frisör / Skönhet',
        restaurang: 'Restaurang / Café',
        hantverkare: 'Bygg / Hantverk',
        konsult: 'Konsult / Tjänster',
        butik: 'Butik / E-handel',
        annat: 'Annat'
    };
    return map[type] || type;
}

function getWebsiteLabel(val) {
    const map = {
        'no': 'Nej, behöver första hemsida',
        'yes-update': 'Ja, behöver förnyas',
        'yes-new': 'Ja, vill ha helt ny'
    };
    return map[val] || val;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('adminAuth') === 'true') {
        showDashboard();
    }

    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('admin-modal-overlay')) closeDetail();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDetail();
    });
});
