// ===== Booking Modal =====
let currentStep = 1;
const totalSteps = 5;
let bookingData = {
    business: '',
    hasWebsite: '',
    goals: [],
    name: '',
    email: '',
    phone: '',
    company: '',
    date: null,
    time: ''
};
let calendarStart = null; // First date shown in calendar
let selectedDate = null;
let selectedTime = null;

function getToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function getMonday(d) {
    d = new Date(d);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
}

function openModal() {
    document.getElementById('bookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    currentStep = 1;
    calendarStart = getMonday(new Date());
    updateProgress();
    showStep(1);
    generateCalendar();
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.body.style.overflow = '';
    // Reset after fade-out animation completes
    setTimeout(() => {
        currentStep = 1;
        bookingData = { business: '', hasWebsite: '', goals: [], name: '', email: '', phone: '', company: '', date: null, time: '' };
        selectedDate = null;
        selectedTime = null;
        document.querySelectorAll('.option-card, .option-card-wide').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.checkbox-card input').forEach(c => c.checked = false);
        const form = document.getElementById('contactForm');
        if (form) form.reset();
        const progress = document.querySelector('.modal-progress');
        if (progress) progress.style.display = '';
        showStep(1);
        updateProgress();
    }, 350);
}

function updateProgress() {
    document.getElementById('progressFill').style.width = (currentStep / totalSteps) * 100 + '%';
    document.getElementById('progressText').textContent = `Steg ${currentStep} av ${totalSteps}`;
}

function showStep(step) {
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById('step' + step);
    if (stepEl) stepEl.classList.add('active');
    if (step === 'Confirm') document.getElementById('stepConfirm').classList.add('active');
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        updateProgress();
        showStep(currentStep);
        if (currentStep === 5) generateCalendar();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateProgress();
        showStep(currentStep);
    }
}

function selectOption(element, field) {
    const parent = element.parentElement;
    parent.querySelectorAll('.option-card, .option-card-wide').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');

    // If "annat" is selected in business type, show custom input and DON'T proceed
    if (field === 'business' && element.dataset.value === 'annat') {
        // Remove existing input if any
        const existingInput = document.getElementById('custom-business-input');
        if (existingInput) existingInput.remove();

        // Create and insert custom input field
        const inputHTML = `
            <div id="custom-business-input" style="margin-top: 20px;">
                <label for="custom-business" style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Vilken bransch?</label>
                <input type="text" id="custom-business" placeholder="T.ex. Tandläkare, PT, Hudvård..." style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
                <button onclick="submitCustomBusiness()" class="btn btn-primary" style="margin-top: 12px; width: 100%;">Fortsätt</button>
            </div>
        `;
        parent.insertAdjacentHTML('afterend', inputHTML);

        // Focus the input field
        setTimeout(() => {
            const input = document.getElementById('custom-business');
            if (input) input.focus();
        }, 100);

        // IMPORTANT: Return here to NOT proceed to next step
        return;
    }

    // For all other options, remove custom input if it exists and proceed
    const customInput = document.getElementById('custom-business-input');
    if (customInput) customInput.remove();

    bookingData[field] = element.dataset.value;
    setTimeout(() => nextStep(), 300);
}

function submitCustomBusiness() {
    const input = document.getElementById('custom-business');
    if (!input) return;

    const value = input.value.trim();
    if (!value) {
        alert('Vänligen ange din bransch');
        input.focus();
        return;
    }

    bookingData.business = 'annat: ' + value;
    const customInput = document.getElementById('custom-business-input');
    if (customInput) customInput.remove();

    nextStep();
}

function validateAndNext() {
    const name = document.getElementById('modal-name').value.trim();
    const email = document.getElementById('modal-email').value.trim();

    if (!name || !email) {
        alert('Vänligen fyll i namn och email.');
        return;
    }

    if (!email.includes('@')) {
        alert('Vänligen ange en giltig email.');
        return;
    }

    bookingData.name = name;
    bookingData.email = email;
    bookingData.phone = document.getElementById('modal-phone').value.trim();
    bookingData.company = document.getElementById('modal-company').value.trim();

    // Collect goals
    bookingData.goals = [];
    document.querySelectorAll('input[name="goals"]:checked').forEach(cb => {
        bookingData.goals.push(cb.value);
    });

    nextStep();
}

// Calendar functions
const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
                   'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

function generateCalendar() {
    const container = document.getElementById('calendarDays');
    if (!container) return;
    container.innerHTML = '';

    const today = getToday();

    for (let i = 0; i < 7; i++) {
        const date = new Date(calendarStart);
        date.setDate(date.getDate() + i);

        const dayEl = document.createElement('button');
        dayEl.className = 'calendar-day';

        const isPast = date < today;
        if (isPast) {
            dayEl.classList.add('disabled');
            dayEl.disabled = true;
        }

        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayEl.classList.add('selected');
        }

        // Mark today
        if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }

        dayEl.innerHTML = `
            <span class="day-name">${dayNames[i]}</span>
            <span class="day-number">${date.getDate()}</span>
        `;

        dayEl.onclick = () => selectDate(date, dayEl);
        container.appendChild(dayEl);

        // Auto-select today on first load
        if (!selectedDate && date.toDateString() === today.toDateString()) {
            selectedDate = date;
            dayEl.classList.add('selected');
            setTimeout(() => generateTimeSlots(), 0);
        }
    }

    // Update month display
    const endDate = new Date(calendarStart);
    endDate.setDate(endDate.getDate() + 6);

    const monthEl = document.getElementById('calendarMonth');
    if (monthEl) {
        if (calendarStart.getMonth() === endDate.getMonth()) {
            monthEl.textContent = `${monthNames[calendarStart.getMonth()]} ${calendarStart.getFullYear()}`;
        } else {
            monthEl.textContent = `${monthNames[calendarStart.getMonth()]} - ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
        }
    }
}

function prevWeek() {
    const minWeek = getMonday(new Date());
    const newStart = new Date(calendarStart);
    newStart.setDate(newStart.getDate() - 7);

    if (newStart >= minWeek) {
        calendarStart = newStart;
        generateCalendar();
    }
}

function nextWeek() {
    calendarStart = new Date(calendarStart);
    calendarStart.setDate(calendarStart.getDate() + 7);
    generateCalendar();
}

function selectDate(date, element) {
    selectedDate = date;
    selectedTime = null;

    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    element.classList.add('selected');

    generateTimeSlots();
    document.getElementById('confirmBooking').disabled = true;
}

async function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    if (!container) return;
    container.innerHTML = '<p class="time-slots-placeholder">Laddar tider...</p>';

    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 17) {
            times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    // Fetch booked times from Supabase for selected date
    const unavailable = new Set();
    if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?booking_date=eq.${dateStr}&select=booking_time`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const booked = await res.json();
            booked.forEach(b => unavailable.add(b.booking_time));
        } catch (err) {
            console.error('Failed to fetch booked times:', err);
        }
    }

    container.innerHTML = '';
    times.forEach(time => {
        const btn = document.createElement('button');
        btn.className = 'time-slot';
        btn.textContent = time;

        if (unavailable.has(time)) {
            btn.classList.add('unavailable');
            btn.disabled = true;
        }

        if (selectedTime === time) {
            btn.classList.add('selected');
        }

        btn.onclick = () => selectTime(time, btn);
        container.appendChild(btn);
    });
}

function selectTime(time, element) {
    selectedTime = time;
    bookingData.time = time;
    bookingData.date = selectedDate;

    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
    element.classList.add('selected');

    document.getElementById('confirmBooking').disabled = false;
}

async function confirmBooking() {
    if (!selectedDate || !selectedTime) return;

    // Format date for display
    const dateStr = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    document.getElementById('confirmDateTime').textContent = `${dateStr} kl. ${selectedTime}`;

    // Format date for database (YYYY-MM-DD)
    const dbDate = selectedDate.toISOString().split('T')[0];

    // Prepare booking data for Supabase
    const bookingRecord = {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone || null,
        company: bookingData.company || null,
        business_type: bookingData.business,
        has_website: bookingData.hasWebsite,
        goals: bookingData.goals,
        booking_date: dbDate,
        booking_time: selectedTime,
        created_at: new Date().toISOString()
    };

    // Save to Supabase
    try {
        await saveBookingToSupabase(bookingRecord);
        console.log('Booking saved successfully:', bookingRecord);

        // Send confirmation emails via Edge Function
        try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-booking-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify(bookingRecord)
            });
            console.log('Confirmation emails sent');
        } catch (emailError) {
            console.error('Failed to send emails:', emailError);
            // Continue anyway - booking is saved
        }
    } catch (error) {
        console.error('Failed to save booking:', error);
        // Still show confirmation - we can handle failed bookings later
    }

    // Show confirmation
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepConfirm').classList.add('active');
    document.querySelector('.modal-progress').style.display = 'none';
}

// Supabase configuration
const SUPABASE_URL = 'https://xklttbborrdoettifjak.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrbHR0YmJvcnJkb2V0dGlmamFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzQ3ODIsImV4cCI6MjA4NjExMDc4Mn0.iJIs2lgGF0fCL8CqrUMg1n4FaJ55adwK5HLk7ooxb4M';

async function saveBookingToSupabase(booking) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(booking)
    });

    if (!response.ok) {
        throw new Error(`Failed to save booking: ${response.status}`);
    }

    return response;
}

// Initialize modal listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Open modal when clicking CTA buttons
    document.querySelectorAll('a[href="#kontakt"], a[href="kontakt.html"], .nav-cta, .btn-primary').forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes('starta') || text.includes('kom igång') || text.includes('boka') || text.includes('gratis')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
    });

    // Auto-open modal only on first visit (per session) and only on homepage
    const isHomepage = window.location.pathname === '/' ||
                       window.location.pathname.endsWith('index.html') ||
                       window.location.pathname === '';

    if (!sessionStorage.getItem('modalShown') && isHomepage) {
        openModal();
        sessionStorage.setItem('modalShown', 'true');
    }

    // Close on overlay click
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});

// ========== MOBILE MENU ==========

function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    nav.classList.toggle('open');
    hamburger.classList.toggle('active');
}
