import '../app.js';
import { isSupabaseConfigured } from '../config.js';
import { listCategories } from '../services/categories.js';
import { listPublishedListings } from '../services/listings.js';
import { escapeHtml, formatCurrency, renderEmpty } from '../ui.js';

const grid = document.querySelector('#listingsGrid');
const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');

let categories = [];

const demoCategories = [
  { id: 'home-repair', name: 'Home repair' },
  { id: 'private-lessons', name: 'Private lessons' },
  { id: 'design-media', name: 'Design and media' },
  { id: 'tech-support', name: 'Tech support' }
];

const demoListings = [
  {
    id: 'demo-1',
    title: 'Apartment repair and small fixes',
    description: 'Fast help for shelves, doors, lamps, silicone, furniture assembly and small home improvements around Sofia.',
    city: 'Sofia',
    price_per_hour: 45,
    category_id: 'home-repair',
    service_categories: { name: 'Home repair' },
    profiles: { full_name: 'Nikolay Petrov' }
  },
  {
    id: 'demo-2',
    title: 'Math lessons for grades 7-12',
    description: 'Personal lessons with exam preparation, homework support and clear weekly progress for students.',
    city: 'Plovdiv',
    price_per_hour: 35,
    category_id: 'private-lessons',
    service_categories: { name: 'Private lessons' },
    profiles: { full_name: 'Maria Ivanova' }
  },
  {
    id: 'demo-3',
    title: 'Logo and social media visuals',
    description: 'Clean brand visuals, campaign banners and ready-to-post social media packages for small businesses.',
    city: 'Varna',
    price_per_hour: 55,
    category_id: 'design-media',
    service_categories: { name: 'Design and media' },
    profiles: { full_name: 'Elena Georgieva' }
  }
];

function listingCard(listing) {
  return `
    <article class="col-md-6 col-xl-4">
      <div class="listing-card">
        <div class="listing-image"><i class="bi bi-tools"></i></div>
        <div class="p-3">
          <div class="d-flex justify-content-between gap-2 align-items-start mb-2">
            <h3 class="h5 mb-0">${escapeHtml(listing.title)}</h3>
            <span class="badge text-bg-success">${formatCurrency(listing.price_per_hour)}</span>
          </div>
          <p class="text-secondary small mb-2">
            <i class="bi bi-tag me-1"></i>${escapeHtml(listing.service_categories?.name || 'General')}
            <span class="mx-1">.</span>
            <i class="bi bi-geo-alt me-1"></i>${escapeHtml(listing.city)}
          </p>
          <p class="text-secondary">${escapeHtml(listing.description).slice(0, 130)}...</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="small text-secondary"><i class="bi bi-person me-1"></i>${escapeHtml(listing.profiles?.full_name || 'Provider')}</span>
            <a class="btn btn-outline-success btn-sm" href="${isSupabaseConfigured() ? `/pages/listing-detail.html?id=${listing.id}` : '#listings'}">View</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

async function loadCategories() {
  categories = isSupabaseConfigured() ? await listCategories() : demoCategories;
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach((category) => {
    categoryFilter.insertAdjacentHTML('beforeend', `<option value="${category.id}">${escapeHtml(category.name)}</option>`);
  });
  document.querySelector('[data-stat-categories]').textContent = categories.length;
}

async function loadListings() {
  grid.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-success" role="status"></div></div>';
  const listings = isSupabaseConfigured()
    ? await listPublishedListings({
        search: searchInput.value,
        categoryId: categoryFilter.value
      })
    : demoListings.filter((listing) => {
        const search = searchInput.value.trim().toLowerCase();
        const matchesSearch =
          !search ||
          listing.title.toLowerCase().includes(search) ||
          listing.description.toLowerCase().includes(search) ||
          listing.city.toLowerCase().includes(search);
        const matchesCategory = !categoryFilter.value || listing.category_id === categoryFilter.value;
        return matchesSearch && matchesCategory;
      });

  document.querySelector('[data-stat-listings]').textContent = listings.length;
  document.querySelector('[data-stat-rating]').textContent = listings.length ? '4.8' : '0.0';
  grid.innerHTML = listings.length ? listings.map(listingCard).join('') : `<div class="col-12">${renderEmpty('No published services yet.')}</div>`;
}

async function init() {
  try {
    await loadCategories();
    await loadListings();
  } catch (error) {
    grid.innerHTML = `<div class="col-12">${renderEmpty(error.message)}</div>`;
  }
}

searchInput.addEventListener('input', () => {
  window.clearTimeout(searchInput.searchTimer);
  searchInput.searchTimer = window.setTimeout(loadListings, 250);
});
categoryFilter.addEventListener('change', loadListings);

await init();
