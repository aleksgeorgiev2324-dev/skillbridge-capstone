import '../app.js';
import { requireAdmin } from '../auth.js';
import { createCategory, listCategories } from '../services/categories.js';
import { adminListBookings } from '../services/bookings.js';
import { adminListListings, updateListingStatus } from '../services/listings.js';
import { listProfiles } from '../services/profiles.js';
import { escapeHtml, renderEmpty, showAlert, statusBadge } from '../ui.js';

const message = document.querySelector('#adminMessage');
const listingsBody = document.querySelector('#adminListings');
const usersBox = document.querySelector('#adminUsers');
const categoryForm = document.querySelector('#categoryForm');

function renderListingRow(listing) {
  return `
    <tr data-listing-id="${listing.id}">
      <td>
        <strong>${escapeHtml(listing.title)}</strong>
        <div class="small text-secondary">${escapeHtml(listing.service_categories?.name || 'General')}</div>
      </td>
      <td>${statusBadge(listing.status)}</td>
      <td>${escapeHtml(listing.profiles?.full_name || 'Unknown')}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-success" data-status="published">Publish</button>
          <button class="btn btn-outline-secondary" data-status="draft">Draft</button>
          <button class="btn btn-outline-danger" data-status="rejected">Reject</button>
        </div>
      </td>
    </tr>
  `;
}

function renderUser(profile) {
  const roleRow = Array.isArray(profile.user_roles) ? profile.user_roles[0] : profile.user_roles;
  const role = roleRow?.role || 'user';
  return `
    <div class="border rounded p-3">
      <div class="d-flex justify-content-between gap-2">
        <strong>${escapeHtml(profile.full_name || 'Unnamed user')}</strong>
        <span class="badge text-bg-${role === 'admin' ? 'dark' : 'secondary'}">${escapeHtml(role)}</span>
      </div>
      <p class="small text-secondary mb-0">${escapeHtml(profile.city || 'No city')}</p>
    </div>
  `;
}

async function loadAdminData() {
  const [profiles, listings, bookings, categories] = await Promise.all([
    listProfiles(),
    adminListListings(),
    adminListBookings(),
    listCategories()
  ]);

  document.querySelector('#usersCount').textContent = profiles.length;
  document.querySelector('#listingsCount').textContent = listings.length;
  document.querySelector('#bookingsCount').textContent = bookings.length;
  document.querySelector('#categoriesCount').textContent = categories.length;
  listingsBody.innerHTML = listings.length ? listings.map(renderListingRow).join('') : `<tr><td colspan="4">${renderEmpty('No listings to moderate.')}</td></tr>`;
  usersBox.innerHTML = profiles.length ? profiles.map(renderUser).join('') : renderEmpty('No user profiles yet.');
}

async function init() {
  const user = await requireAdmin();
  if (!user) {
    return;
  }

  try {
    await loadAdminData();
  } catch (error) {
    showAlert(message, error.message, 'danger');
  }
}

listingsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-status]');
  if (!button) {
    return;
  }

  const listingId = button.closest('[data-listing-id]').dataset.listingId;
  await updateListingStatus(listingId, button.dataset.status);
  await loadAdminData();
});

categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await createCategory({
      name: categoryForm.categoryName.value.trim(),
      slug: categoryForm.categorySlug.value.trim()
    });
    categoryForm.reset();
    await loadAdminData();
    showAlert(message, 'Category added.', 'success');
  } catch (error) {
    showAlert(message, error.message, 'danger');
  }
});

await init();
