// Main interactive scripts for Serendiva Nature Resort website

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupBookingModal();
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

// Booking modal & dynamic cost calculator
function setupBookingModal() {
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('modalClose');
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

  const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  // Booking form submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('resName')?.value || 'Guest';
      const referenceNo = 'SND-' + Math.floor(100000 + Math.random() * 900000);
      const totalCost = totalPriceLabel ? totalPriceLabel.textContent : '$320';

      alert(`Thank you, ${guestName}!\n\nYour provisional booking request (${referenceNo}) has been received.\nEstimated Total: ${totalCost}\n\nOur team will confirm your reservation by email.`);
      modal.classList.remove('active');
      bookingForm.reset();
    });
  }
}

// Category tabs on the Services / Dining page
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

// Contact form submission
function setupContactForm() {
  const form = document.getElementById('contactInquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sender = document.getElementById('contactName')?.value || 'Guest';
    alert(`Thank you, ${sender}. Your message has been sent to our reception team.`);
    form.reset();
  });
}
