import '../app.js';
import { getCurrentUser } from '../auth.js';
import { createBooking } from '../services/bookings.js';
import { createDownloadUrl, listListingFiles } from '../services/files.js';
import { getListing } from '../services/listings.js';
import { createReview, listReviews } from '../services/reviews.js';
import { escapeHtml, formatCurrency, getQueryParam, renderEmpty, setLoading, showAlert } from '../ui.js';

const listingId = getQueryParam('id');
const detail = document.querySelector('#listingDetail');
const filesList = document.querySelector('#filesList');
const reviewsList = document.querySelector('#reviewsList');
const bookingForm = document.querySelector('#bookingForm');
const reviewForm = document.querySelector('#reviewForm');
const message = document.querySelector('#detailMessage');
let listing = null;
let currentUser = null;

function renderDetail(item) {
  detail.innerHTML = `
    <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
      <div>
        <span class="badge text-bg-success mb-2">${escapeHtml(item.service_categories?.name || 'General')}</span>
        <h1 class="h2 mb-2">${escapeHtml(item.title)}</h1>
        <p class="text-secondary mb-0">
          <i class="bi bi-geo-alt me-1"></i>${escapeHtml(item.city)}
          <span class="mx-1">.</span>
          <i class="bi bi-person me-1"></i>${escapeHtml(item.profiles?.full_name || 'Provider')}
        </p>
      </div>
      <div class="text-md-end">
        <p class="h3 mb-0">${formatCurrency(item.price_per_hour)}</p>
        <p class="text-secondary mb-0">per hour</p>
      </div>
    </div>
    <p class="lead">${escapeHtml(item.description)}</p>
    ${
      currentUser?.id === item.owner_id
        ? `<a class="btn btn-outline-dark" href="/pages/listing-form.html?id=${item.id}"><i class="bi bi-pencil me-2"></i>Edit service</a>`
        : ''
    }
  `;
}

async function renderFiles() {
  const files = await listListingFiles(listingId);
  if (!files.length) {
    filesList.innerHTML = renderEmpty('No uploaded files.');
    return;
  }

  filesList.innerHTML = files
    .map(
      (file) => `
        <button class="btn btn-outline-dark text-start" type="button" data-file-path="${escapeHtml(file.file_path)}">
          <i class="bi bi-download me-2"></i>${escapeHtml(file.file_name)}
        </button>
      `
    )
    .join('');
}

async function renderReviews() {
  const reviews = await listReviews(listingId);
  reviewsList.innerHTML = reviews.length
    ? reviews
        .map(
          (review) => `
            <div class="border rounded p-3">
              <div class="d-flex justify-content-between gap-2 mb-1">
                <strong>${escapeHtml(review.profiles?.full_name || 'User')}</strong>
                <span class="text-warning">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p class="mb-0 text-secondary">${escapeHtml(review.comment || '')}</p>
            </div>
          `
        )
        .join('')
    : renderEmpty('No reviews yet.');
}

async function init() {
  currentUser = await getCurrentUser();
  if (!listingId) {
    detail.innerHTML = renderEmpty('Missing listing id.');
    return;
  }

  try {
    listing = await getListing(listingId);
    renderDetail(listing);
    await Promise.all([renderFiles(), renderReviews()]);
  } catch (error) {
    detail.innerHTML = renderEmpty(error.message);
  }
}

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = bookingForm.querySelector('button[type="submit"]');

  if (!currentUser) {
    showAlert(message, 'Login before requesting a booking.', 'warning');
    return;
  }

  if (currentUser.id === listing.owner_id) {
    showAlert(message, 'You cannot book your own service.', 'warning');
    return;
  }

  setLoading(submitButton, true, 'Sending...');

  try {
    await createBooking({
      listing_id: listing.id,
      provider_id: listing.owner_id,
      customer_id: currentUser.id,
      scheduled_for: bookingForm.scheduledFor.value,
      message: bookingForm.message.value.trim()
    });
    bookingForm.reset();
    showAlert(message, 'Booking request sent.', 'success');
  } catch (error) {
    showAlert(message, error.message, 'danger');
  } finally {
    setLoading(submitButton, false);
  }
});

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) {
    showAlert(message, 'Login before adding a review.', 'warning');
    return;
  }

  try {
    await createReview({
      listing_id: listing.id,
      reviewer_id: currentUser.id,
      rating: Number(reviewForm.rating.value),
      comment: reviewForm.comment.value.trim()
    });
    reviewForm.reset();
    await renderReviews();
  } catch (error) {
    showAlert(message, error.message, 'danger');
  }
});

filesList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-file-path]');
  if (!button) {
    return;
  }

  const url = await createDownloadUrl(button.dataset.filePath);
  window.open(url, '_blank', 'noopener');
});

await init();
