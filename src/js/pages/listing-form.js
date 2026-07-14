import '../app.js';
import { requireAuth } from '../auth.js';
import { listCategories } from '../services/categories.js';
import { createListing, deleteListing, getListing, updateListing } from '../services/listings.js';
import { uploadListingFiles } from '../services/files.js';
import { escapeHtml, getQueryParam, setLoading, showAlert } from '../ui.js';

const form = document.querySelector('#listingForm');
const message = document.querySelector('#listingMessage');
const deleteButton = document.querySelector('#deleteListing');
const listingId = getQueryParam('id');
let currentUser = null;

async function loadCategories() {
  const categories = await listCategories();
  form.categoryId.innerHTML = categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join('');
}

async function loadListingForEdit() {
  if (!listingId) {
    return;
  }

  document.querySelector('#pageTitle').textContent = 'Edit service';
  deleteButton.classList.remove('d-none');
  const listing = await getListing(listingId);

  if (listing.owner_id !== currentUser.id) {
    window.location.href = '/pages/dashboard.html';
    return;
  }

  form.title.value = listing.title;
  form.price.value = listing.price_per_hour;
  form.categoryId.value = listing.category_id;
  form.city.value = listing.city;
  form.description.value = listing.description;
  form.status.value = listing.status;
}

async function init() {
  currentUser = await requireAuth();
  if (!currentUser) {
    return;
  }

  try {
    await loadCategories();
    await loadListingForEdit();
  } catch (error) {
    showAlert(message, error.message, 'danger');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setLoading(submitButton, true, 'Saving...');

  const payload = {
    owner_id: currentUser.id,
    category_id: form.categoryId.value,
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    city: form.city.value.trim(),
    price_per_hour: Number(form.price.value),
    status: form.status.value,
    updated_at: new Date().toISOString()
  };

  try {
    const listing = listingId ? await updateListing(listingId, payload) : await createListing(payload);
    if (form.files.files.length) {
      await uploadListingFiles([...form.files.files], listing.id, currentUser.id);
    }
    window.location.href = `/pages/listing-detail.html?id=${listing.id}`;
  } catch (error) {
    showAlert(message, error.message, 'danger');
  } finally {
    setLoading(submitButton, false);
  }
});

deleteButton.addEventListener('click', async () => {
  if (!listingId || !window.confirm('Delete this service?')) {
    return;
  }

  await deleteListing(listingId);
  window.location.href = '/pages/dashboard.html';
});

await init();
