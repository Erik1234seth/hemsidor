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
let currentWeekStart = getMonday(new Date());
let selectedDate = null;
let selectedTime = null;

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function openModal() {
    document.getElementById('bookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    currentStep = 1;
    updateProgress();
    showStep(1);
    generateCalendar();
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.body.style.overflow = '';
    // Reset form
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
    bookingData[field] = element.dataset.value;
    setTimeout(() => nextStep(), 300);
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);

        const dayEl = document.createElement('button');
        dayEl.className = 'calendar-day';

        const isWeekend = i >= 5;
        const isPast = date < today;

        if (isWeekend || isPast) {
            dayEl.classList.add('disabled');
            dayEl.disabled = true;
        }

        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayEl.classList.add('selected');
        }

        dayEl.innerHTML = `
            <span class="day-name">${dayNames[i]}</span>
            <span class="day-number">${date.getDate()}</span>
        `;

        dayEl.onclick = () => selectDate(date, dayEl);
        container.appendChild(dayEl);
    }

    // Update month display
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const monthEl = document.getElementById('calendarMonth');
    if (monthEl) {
        if (currentWeekStart.getMonth() === endOfWeek.getMonth()) {
            monthEl.textContent = `${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()}`;
        } else {
            monthEl.textContent = `${monthNames[currentWeekStart.getMonth()]} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
        }
    }
}

function prevWeek() {
    const today = getMonday(new Date());
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() - 7);

    if (newWeek >= today) {
        currentWeekStart = newWeek;
        generateCalendar();
    }
}

function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
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

function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    if (!container) return;
    container.innerHTML = '';

    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 17) {
            times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    // Simulate some random unavailable slots
    const unavailable = new Set();
    for (let i = 0; i < 4; i++) {
        unavailable.add(times[Math.floor(Math.random() * times.length)]);
    }

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

function confirmBooking() {
    if (!selectedDate || !selectedTime) return;

    // Format date for display
    const dateStr = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    document.getElementById('confirmDateTime').textContent = `${dateStr} kl. ${selectedTime}`;

    // Here you would normally send the data to a server
    console.log('Booking data:', bookingData);

    // Show confirmation
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepConfirm').classList.add('active');
    document.querySelector('.modal-progress').style.display = 'none';
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
