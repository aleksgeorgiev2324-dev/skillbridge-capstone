import '../app.js';
import { requireAuth } from '../auth.js';
import { listIncomingBookings, listOutgoingBookings, updateBookingStatus } from '../services/bookings.js';
import { listMyListings } from '../services/listings.js';
import { escapeHtml, formatCurrency, formatDate, renderEmpty, showAlert, statusBadge } from '../ui.js';

const message = document.querySelector('#dashboardMessage');
const myListings = document.querySelector('#myListings');
const incomingBookings = document.querySelector('#incomingBookings');
const outgoingBookings = document.querySelector('#outgoingBookings');

function renderListing(listing) {
  return `
    <div class="border rounded p-3">
      <div class="d-flex justify-content-between gap-3">
        <div>
          <h3 class="h6 mb-1">${escapeHtml(listing.title)}</h3>
          <p class="small text-secondary mb-0">${escapeHtml(listing.service_categories?.name || 'General')} . ${formatCurrency(listing.price_per_hour)}</p>
        </div>
        ${statusBadge(listing.status)}
      </div>
      <div class="d-flex gap-2 mt-3">
        <a class="btn btn-outline-success btn-sm" href="/pages/listing-detail.html?id=${listing.id}">Open</a>
        <a class="btn btn-outline-dark btn-sm" href="/pages/listing-form.html?id=${listing.id}">Edit</a>
      </div>
    </div>
  `;
}

function renderBooking(booking, direction) {
  const person = direction === 'incoming' ? booking.profiles?.full_name || 'Customer' : booking.profiles?.full_name || 'Provider';
  return `
    <div class="border rounded p-3" data-booking-id="${booking.id}">
      <div class="d-flex justify-content-between gap-2 mb-2">
        <h3 class="h6 mb-0">${escapeHtml(booking.listings?.title || 'Service')}</h3>
        ${statusBadge(booking.status)}
      </div>
      <p class="small text-secondary mb-1"><i class="bi bi-calendar-event me-1"></i>${formatDate(booking.scheduled_for)}</p>
      <p class="small text-secondary mb-2"><i class="bi bi-person me-1"></i>${escapeHtml(person)}</p>
      <p class="mb-3">${escapeHtml(booking.message || 'No message provided.')}</p>
      ${
        direction === 'incoming'
          ? `
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-sm" data-status="confirmed">Confirm</button>
              <button class="btn btn-outline-danger btn-sm" data-status="cancelled">Cancel</button>
            </div>
          `
          : ''
      }
    </div>
  `;
}

async function init() {
  const user = await requireAuth();
  if (!user) {
    return;
  }

  try {
    const [listings, incoming, outgoing] = await Promise.all([
      listMyListings(user.id),
      listIncomingBookings(user.id),
      listOutgoingBookings(user.id)
    ]);

    document.querySelector('#myListingsCount').textContent = listings.length;
    document.querySelector('#incomingBookingsCount').textContent = incoming.length;
    document.querySelector('#outgoingBookingsCount').textContent = outgoing.length;

    myListings.innerHTML = listings.length ? listings.map(renderListing).join('') : renderEmpty('You have not created services yet.');
    incomingBookings.innerHTML = incoming.length ? incoming.map((booking) => renderBooking(booking, 'incoming')).join('') : renderEmpty('No incoming bookings.');
    outgoingBookings.innerHTML = outgoing.length ? outgoing.map((booking) => renderBooking(booking, 'outgoing')).join('') : renderEmpty('You have not requested bookings.');
  } catch (error) {
    showAlert(message, error.message, 'danger');
  }
}

incomingBookings.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-status]');
  if (!button) {
    return;
  }

  const bookingId = button.closest('[data-booking-id]').dataset.bookingId;
  await updateBookingStatus(bookingId, button.dataset.status);
  await init();
});

await init();
