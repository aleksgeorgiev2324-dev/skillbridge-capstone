export function showAlert(element, message, type = 'info') {
  if (!element) {
    return;
  }

  element.className = `alert alert-${type}`;
  element.textContent = message;
}

export function hideAlert(element) {
  if (!element) {
    return;
  }

  element.classList.add('d-none');
  element.textContent = '';
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function setLoading(button, isLoading, label = 'Please wait...') {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}`;
    return;
  }

  button.disabled = false;
  button.innerHTML = button.dataset.originalText || button.innerHTML;
}

export function renderEmpty(message) {
  return `<div class="empty-state"><i class="bi bi-inbox fs-1 d-block mb-2"></i>${escapeHtml(message)}</div>`;
}

export function statusBadge(status) {
  const variants = {
    draft: 'secondary',
    pending: 'warning',
    published: 'success',
    rejected: 'danger',
    cancelled: 'secondary',
    confirmed: 'success',
    completed: 'primary'
  };

  return `<span class="badge text-bg-${variants[status] || 'secondary'} badge-status">${escapeHtml(status)}</span>`;
}
