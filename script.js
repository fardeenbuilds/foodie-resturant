/**
 * ==========================================================================
 * Foodie Restaurant - Pure Vanilla JavaScript (Zero Framework)
 * Features:
 *   1. Category Tab Filtering
 *   2. Live Menu Search Filtering
 *   3. Interactive Table Booking Form Validation & Submission
 *   4. Instant Booking Reference ID & Table Assignment
 *   5. Confirmation Modal & Printable Receipt Slip
 *   6. LocalStorage Data Persistence
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initCategoryTabs();
  initMenuSearch();
  initDateConstraints();
  initBookingForm();
});

/* ==========================================================================
   2. Menu Category Tabs Filter
   ========================================================================== */
function initCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const categoryBlocks = document.querySelectorAll('.menu-category-block');

  if (!tabButtons.length || !categoryBlocks.length) return;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const targetCategory = button.getAttribute('data-category');

      categoryBlocks.forEach(block => {
        const blockCategory = block.getAttribute('data-category');
        if (targetCategory === 'all' || blockCategory === targetCategory) {
          block.style.display = 'block';
        } else {
          block.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. Live Search Filter
   ========================================================================== */
function initMenuSearch() {
  const searchInput = document.getElementById('menuSearch');
  const menuRows = document.querySelectorAll('.menu-row');
  const categoryBlocks = document.querySelectorAll('.menu-category-block');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();

    menuRows.forEach(row => {
      const title = row.querySelector('h4')?.textContent.toLowerCase() || '';
      const desc = row.querySelector('p')?.textContent.toLowerCase() || '';

      if (!term || title.includes(term) || desc.includes(term)) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });

    // Hide empty category blocks if no matching items
    categoryBlocks.forEach(block => {
      const visibleRows = block.querySelectorAll('.menu-row[style*="display: flex"], .menu-row:not([style*="display: none"])');
      if (visibleRows.length === 0 && term) {
        block.style.display = 'none';
      } else {
        block.style.display = 'block';
      }
    });
  });
}

/* ==========================================================================
   4. Date Constraint (Min date is today)
   ========================================================================== */
function initDateConstraints() {
  const dateInput = document.getElementById('bookDate');
  if (!dateInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;

  dateInput.min = formattedToday;
  dateInput.value = formattedToday;
}

/* ==========================================================================
   5. Interactive Table Booking Form Handling
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('tableBookingForm');
  const modal = document.getElementById('reservationModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const printSlipBtn = document.getElementById('printSlipBtn');
  const receiptBody = document.getElementById('receiptBody');

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Input elements
    const nameInput = document.getElementById('bookName');
    const phoneInput = document.getElementById('bookPhone');
    const emailInput = document.getElementById('bookEmail');
    const guestsInput = document.getElementById('bookGuests');
    const dateInput = document.getElementById('bookDate');
    const timeInput = document.getElementById('bookTime');
    const seatingInput = document.getElementById('bookSeating');
    const notesInput = document.getElementById('bookNotes');

    // Error span elements
    const nameErr = document.getElementById('nameErr');
    const phoneErr = document.getElementById('phoneErr');
    const dateErr = document.getElementById('dateErr');
    const timeErr = document.getElementById('timeErr');

    // Reset errors
    [nameErr, phoneErr, dateErr, timeErr].forEach(span => {
      if (span) span.textContent = '';
    });
    [nameInput, phoneInput, dateInput, timeInput].forEach(inp => {
      if (inp) inp.classList.remove('error-input');
    });

    let isValid = true;

    // 1. Name Validation
    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      nameInput.classList.add('error-input');
      nameErr.textContent = 'Please enter a valid full name (minimum 3 characters).';
      isValid = false;
    }

    // 2. 10-Digit Indian Phone Number Validation
    const rawPhone = phoneInput.value.trim().replace(/\D/g, '');
    const phonePattern = /^[6-9]\d{9}$/;
    if (!rawPhone || !phonePattern.test(rawPhone)) {
      phoneInput.classList.add('error-input');
      phoneErr.textContent = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
      isValid = false;
    }

    // 3. Date Validation
    if (!dateInput.value) {
      dateInput.classList.add('error-input');
      dateErr.textContent = 'Please choose a dining date.';
      isValid = false;
    }

    // 4. Time Slot Validation
    if (!timeInput.value) {
      timeInput.classList.add('error-input');
      timeErr.textContent = 'Please select a dining time slot.';
      isValid = false;
    }

    if (!isValid) return;

    // Generate Booking Details
    const bookingId = 'FR-' + Math.floor(1000 + Math.random() * 9000);
    const tableNumber = 'T-' + Math.floor(1 + Math.random() * 20);

    const bookingData = {
      id: bookingId,
      table: tableNumber,
      name: nameInput.value.trim(),
      phone: rawPhone,
      email: emailInput.value.trim() || 'Not Provided',
      guests: guestsInput.value,
      date: dateInput.value,
      time: timeInput.value,
      seating: seatingInput.value,
      notes: notesInput.value.trim() || 'None',
      createdAt: new Date().toISOString()
    };

    // Save to LocalStorage
    saveBooking(bookingData);

    // Populate Receipt Modal
    receiptBody.innerHTML = `
      <div class="receipt-item">
        <span class="label">Booking Reference:</span>
        <span class="ref-badge">${bookingData.id}</span>
      </div>
      <div class="receipt-item">
        <span class="label">Assigned Table:</span>
        <span class="val">${bookingData.table} (${bookingData.seating})</span>
      </div>
      <div class="receipt-item">
        <span class="label">Guest Name:</span>
        <span class="val">${bookingData.name}</span>
      </div>
      <div class="receipt-item">
        <span class="label">Party Size:</span>
        <span class="val">${bookingData.guests} Guests</span>
      </div>
      <div class="receipt-item">
        <span class="label">Date & Time:</span>
        <span class="val">${bookingData.date} at ${bookingData.time}</span>
      </div>
      <div class="receipt-item">
        <span class="label">Phone:</span>
        <span class="val">+91 ${bookingData.phone}</span>
      </div>
      <div class="receipt-item">
        <span class="label">Special Requests:</span>
        <span class="val">${bookingData.notes}</span>
      </div>
    `;

    // Show Confirmation Modal
    modal.classList.add('active');

    // Reset Form
    form.reset();
    initDateConstraints();
  });

  // Close Modal
  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Print Slip
  printSlipBtn.addEventListener('click', () => {
    window.print();
  });
}

function saveBooking(booking) {
  try {
    const list = JSON.parse(localStorage.getItem('foodie_bookings') || '[]');
    list.unshift(booking);
    localStorage.setItem('foodie_bookings', JSON.stringify(list.slice(0, 10)));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}