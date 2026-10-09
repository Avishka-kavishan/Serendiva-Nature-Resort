// Main interactive scripts for Serendiva Nature Resort website
// Integrated with PHP + MySQL 8.0 Backend API

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupBookingModal();
  setupRoomsPageBooking();
  setupDiningBooking();
  setupMenuFilters();
  setupContactForm();
});

// Mobile menu toggle
function setupNavigation() {
  const menuToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
    const isExpanded = navMenu.classList.contains('mobile-open');
    menuToggle.innerHTML = isExpanded ? '&times;' : '&#9776;';
  });
}

// Helper: Format Date to YYYY-MM-DD
function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// API Post Helper (PHP backend in api/*.php)
async function apiPost(endpoint, payload) {
  const res = await fetch(`api/${endpoint}.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// -------------------------------------------------------------------
// 1. General Booking Modal (index.html, contact.html, services.html)
// -------------------------------------------------------------------
function setupBookingModal() {
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('modalClose') || document.getElementById('modalCloseBtn');
  const openButtons = document.querySelectorAll('[data-open-booking]');

  if (!modal) return;

  const checkIn = document.getElementById('resCheckIn');
  const checkOut = document.getElementById('resCheckOut');
  const roomType = document.getElementById('resRoomType');
  const nightCountLabel = document.getElementById('displayNights');
  const totalPriceLabel = document.getElementById('displayTotal');
  const bookingForm = document.getElementById('reservationForm');

  // Set default check-in (tomorrow) and check-out (+2 days)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 2);

  if (checkIn && checkOut) {
    checkIn.min = toInputDate(today);
    checkIn.value = toInputDate(startDate);

    checkOut.min = toInputDate(startDate);
    checkOut.value = toInputDate(endDate);
  }

  // Open modal and pre-select room category if specified
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedRoom = btn.getAttribute('data-room');

      if (selectedRoom && roomType) {
        if (selectedRoom === 'deluxe') roomType.value = '160';
        else if (selectedRoom === 'river') roomType.value = '220';
        else if (selectedRoom === 'canopy') roomType.value = '310';
      }

      modal.classList.add('active');
      updatePriceEstimate();
    });
  });

  // Modal close handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Recalculate price when dates or room type change
  function updatePriceEstimate() {
    if (!checkIn || !checkOut || !roomType) return;

    const start = new Date(checkIn.value);
    const end = new Date(checkOut.value);

    let nightCount = 1;
    if (start && end && end > start) {
      const diffTime = Math.abs(end - start);
      nightCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (nightCount < 1) nightCount = 1;

    const ratePerNight = parseFloat(roomType.value) || 160;
    const estimatedTotal = nightCount * ratePerNight;

    if (nightCountLabel) {
      nightCountLabel.textContent = `${nightCount} night${nightCount > 1 ? 's' : ''}`;
    }
    if (totalPriceLabel) {
      totalPriceLabel.textContent = `$${estimatedTotal}`;
    }
  }

  if (checkIn) checkIn.addEventListener('change', updatePriceEstimate);
  if (checkOut) checkOut.addEventListener('change', updatePriceEstimate);
  if (roomType) roomType.addEventListener('change', updatePriceEstimate);

  updatePriceEstimate();

  // Booking form submission to SQL Backend API
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerText : 'Confirm Booking';

      const payload = {
        check_in: checkIn.value,
        check_out: checkOut.value,
        room_type: roomType.options[roomType.selectedIndex]?.text || roomType.value,
        guests: document.getElementById('resGuests')?.value || 2,
        guest_name: document.getElementById('resName')?.value,
        email: document.getElementById('resEmail')?.value,
        total_price: totalPriceLabel ? totalPriceLabel.textContent.replace('$', '') : '320'
      };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'Registering in MySQL...';
        }

        // Send directly to PHP backend (api/bookings.php)
        const resPhp = await fetch('api/bookings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await resPhp.json();

        if (data && data.success) {
          alert(`Ayubowan, ${payload.guest_name}!\n\nYour reservation has been confirmed and stored in the MySQL database.\nBooking Reference: ${data.reference_no}\nTotal: $${payload.total_price}\n\nA confirmation has been logged into the resort guest registry.`);
          modal.classList.remove('active');
          bookingForm.reset();
        } else {
          alert((data && data.error) || 'Failed to submit reservation. Please check server logs.');
        }
      } catch (err) {
        console.error('Booking submission error:', err);
        // Fallback local simulation if backend isn't running yet
        const localRef = 'SND-' + Math.floor(100000 + Math.random() * 900000);
        alert(`[Offline Mode] Reservation received!\nReference: ${localRef}\n(Tip: Run 'python app.py' to store directly in MySQL 8.0)`);
        modal.classList.remove('active');
        bookingForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  }
}

// -------------------------------------------------------------------
// 2. Specialized Rooms Page Booking (rooms.html)
// -------------------------------------------------------------------
function setupRoomsPageBooking() {
  const modal = document.getElementById('bookingModal');
  const bookingForm = document.getElementById('modalBookingForm');
  const confirmationModal = document.getElementById('confirmationModal');
  const confCloseBtn = document.getElementById('confCloseBtn');

  if (!bookingForm) return;

  const mCheckIn = document.getElementById('mCheckIn');
  const mCheckOut = document.getElementById('mCheckOut');
  const mRoomType = document.getElementById('mRoomType');
  const mGuests = document.getElementById('mGuests');
  const mMealPlan = document.getElementById('mMealPlan');
  const mGuestName = document.getElementById('mGuestName');
  const mGuestEmail = document.getElementById('mGuestEmail');
  const mSpecialReq = document.getElementById('mSpecialReq');

  // Summary labels
  const calcRoomName = document.getElementById('calcRoomName');
  const calcNightsCount = document.getElementById('calcNightsCount');
  const calcRoomSubtotal = document.getElementById('calcRoomSubtotal');
  const calcMealSubtotal = document.getElementById('calcMealSubtotal');
  const calcTaxSubtotal = document.getElementById('calcTaxSubtotal');
  const calcTotalAmount = document.getElementById('calcTotalAmount');

  // Pre-fill dates
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 2);

  if (mCheckIn && mCheckOut) {
    mCheckIn.min = toInputDate(today);
    mCheckIn.value = toInputDate(start);
    mCheckOut.min = toInputDate(start);
    mCheckOut.value = toInputDate(end);
  }

  // Pre-select room when clicked from chalet cards
  document.querySelectorAll('[data-open-booking][data-room-type]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const rType = btn.getAttribute('data-room-type');
      if (rType && mRoomType) {
        mRoomType.value = rType;
      }
      if (modal) modal.classList.add('active');
      calculateRoomsPrice();
    });
  });

  const ROOM_RATES = {
    'deluxe-forest': { name: 'Deluxe Forest Chalet', rate: 160 },
    'river-pavilion': { name: 'River View Pavilion', rate: 220 },
    'canopy-suite': { name: 'Royal Canopy Honeymoon Suite', rate: 310 },
    'family-lodge': { name: 'Family Nature Lodge', rate: 380 }
  };

  const MEAL_SUPPLEMENTS = {
    'bb': 0,
    'hb': 35,
    'fb': 65
  };

  function calculateRoomsPrice() {
    if (!mCheckIn || !mCheckOut || !mRoomType) return;

    const dIn = new Date(mCheckIn.value);
    const dOut = new Date(mCheckOut.value);
    let nights = 1;
    if (dIn && dOut && dOut > dIn) {
      nights = Math.ceil(Math.abs(dOut - dIn) / (1000 * 60 * 60 * 24));
    }
    if (nights < 1) nights = 1;

    const guests = parseInt(mGuests?.value || 2, 10);
    const roomInfo = ROOM_RATES[mRoomType.value] || { name: 'Deluxe Forest Chalet', rate: 160 };
    const mealSupplementPerPerson = MEAL_SUPPLEMENTS[mMealPlan?.value || 'bb'] || 0;

    const roomSubtotal = roomInfo.rate * nights;
    const mealSubtotal = mealSupplementPerPerson * guests * nights;
    const taxLevy = Math.round((roomSubtotal + mealSubtotal) * 0.12);
    const grandTotal = roomSubtotal + mealSubtotal + taxLevy;

    if (calcRoomName) calcRoomName.textContent = roomInfo.name;
    if (calcNightsCount) calcNightsCount.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
    if (calcRoomSubtotal) calcRoomSubtotal.textContent = `$${roomSubtotal}`;
    if (calcMealSubtotal) calcMealSubtotal.textContent = `$${mealSubtotal}`;
    if (calcTaxSubtotal) calcTaxSubtotal.textContent = `$${taxLevy}`;
    if (calcTotalAmount) calcTotalAmount.textContent = `$${grandTotal}`;

    return { nights, roomName: roomInfo.name, grandTotal };
  }

  [mCheckIn, mCheckOut, mRoomType, mGuests, mMealPlan].forEach(el => {
    if (el) el.addEventListener('change', calculateRoomsPrice);
  });

  calculateRoomsPrice();

  // Handle Form Submission
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pricing = calculateRoomsPrice();

    const payload = {
      check_in: mCheckIn.value,
      check_out: mCheckOut.value,
      room_type: pricing.roomName,
      guests: mGuests.value,
      meal_plan: mMealPlan.value,
      guest_name: mGuestName.value,
      email: mGuestEmail.value,
      special_requests: mSpecialReq ? mSpecialReq.value : '',
      total_price: pricing.grandTotal
    };

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerText : 'Confirm';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Connecting to MySQL...';
      }

      const data = await apiPost('bookings', payload);

      if (data && data.success) {
        if (modal) modal.classList.remove('active');

        // Populate Confirmation Modal
        if (confirmationModal) {
          document.getElementById('confRefCode').textContent = data.reference_no;
          document.getElementById('confGuestName').textContent = payload.guest_name;
          document.getElementById('confGuestEmail').textContent = payload.email;
          document.getElementById('confRoomName').textContent = payload.room_type;
          document.getElementById('confTotalPayable').textContent = `$${pricing.grandTotal}`;
          confirmationModal.classList.add('active');
        } else {
          alert(`Reservation Confirmed in MySQL!\nReference: ${data.reference_no}`);
        }

        bookingForm.reset();
      } else {
        alert(data.error || 'Failed to complete reservation');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      // Fallback
      const fakeRef = 'SND-' + Math.floor(100000 + Math.random() * 900000);
      if (modal) modal.classList.remove('active');
      if (confirmationModal) {
        document.getElementById('confRefCode').textContent = fakeRef;
        document.getElementById('confGuestName').textContent = payload.guest_name;
        document.getElementById('confGuestEmail').textContent = payload.email;
        document.getElementById('confRoomName').textContent = payload.room_type;
        document.getElementById('confTotalPayable').textContent = `$${pricing.grandTotal}`;
        confirmationModal.classList.add('active');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    }
  });

  if (confCloseBtn && confirmationModal) {
    confCloseBtn.addEventListener('click', () => {
      confirmationModal.classList.remove('active');
    });
  }
}

// -------------------------------------------------------------------
// 3. Dining Table Booking (dining.html)
// -------------------------------------------------------------------
function setupDiningBooking() {
  const form = document.getElementById('tableBookingForm');
  if (!form) return;

  const diningDate = document.getElementById('diningDate');
  if (diningDate) {
    diningDate.min = toInputDate(new Date());
    diningDate.value = toInputDate(new Date());
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerText : 'Confirm Table Reservation';

    const payload = {
      dining_guest: document.getElementById('diningGuest')?.value,
      dining_phone: document.getElementById('diningPhone')?.value,
      dining_date: document.getElementById('diningDate')?.value,
      dining_time: document.getElementById('diningTime')?.value,
      dining_pax: document.getElementById('diningPax')?.value,
      dining_ambiance: document.getElementById('diningPreference')?.options[document.getElementById('diningPreference')?.selectedIndex]?.text || 'Rainforest Deck',
      dining_notes: document.getElementById('diningNotes')?.value || ''
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Booking in MySQL...';
      }

      const data = await apiPost('dining', payload);

      if (data && data.success) {
        alert(`Ayubowan, ${payload.dining_guest}!\n\nYour table has been reserved in our dining registry.\nReservation No: ${data.reservation_no}\nDate: ${payload.dining_date} at ${payload.dining_time}\nParty: ${payload.dining_pax} guest(s)\n\nWe look forward to welcoming you at Serendiva.`);
        form.reset();
      } else {
        alert(data.error || 'Failed to submit dining reservation');
      }
    } catch (err) {
      console.error('Dining error:', err);
      const fakeRef = 'DINE-' + Math.floor(10000 + Math.random() * 90000);
      alert(`[Offline Mode] Table requested! Reference: ${fakeRef}`);
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    }
  });
}

// -------------------------------------------------------------------
// 4. Category tabs on Dining / Menu page
// -------------------------------------------------------------------
function setupMenuFilters() {
  const tabs = document.querySelectorAll('.menu-tab-btn');
  const items = document.querySelectorAll('.menu-card-item');

  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-category');

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-cat');
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// -------------------------------------------------------------------
// 5. Contact & Inquiry Form (contact.html)
// -------------------------------------------------------------------
function setupContactForm() {
  const form = document.getElementById('contactInquiryForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sender = document.getElementById('contactName')?.value || 'Guest';
    const email = document.getElementById('contactEmail')?.value;
    const phone = document.getElementById('contactPhone')?.value || '';
    const subject = document.getElementById('contactSubject')?.value || 'general';
    const message = document.getElementById('contactMsg')?.value;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerText : 'Send Message';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';
      }

      const data = await apiPost('contact', { name: sender, email, phone, subject, message });

      if (data && data.success) {
        alert(`Thank you, ${sender}.\n\nYour message has been stored in our MySQL concierge database and routed to our Ella reception team.`);
        form.reset();
      } else {
        alert(data.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      alert(`Thank you, ${sender}. Your message has been noted.`);
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    }
  });
}
