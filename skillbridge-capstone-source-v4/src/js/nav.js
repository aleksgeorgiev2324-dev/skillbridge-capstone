import { getCurrentUser, getUserRole, signOut } from './auth.js';
import { escapeHtml } from './ui.js';

const links = [
  { href: '/', label: 'Services', icon: 'bi-search' },
  { href: '/pages/dashboard.html', label: 'Dashboard', icon: 'bi-speedometer2', auth: true },
  { href: '/pages/profile.html', label: 'Profile', icon: 'bi-person', auth: true },
  { href: '/pages/admin.html', label: 'Admin', icon: 'bi-shield-lock', admin: true }
];

export async function renderNav() {
  const nav = document.querySelector('[data-app-nav]');
  if (!nav) {
    return;
  }

  const user = await getCurrentUser();
  const role = user ? await getUserRole(user.id).catch(() => 'user') : 'guest';
  const currentPath = window.location.pathname.replace(/\/index.html$/, '/');

  const visibleLinks = links.filter((link) => {
    if (link.admin) {
      return role === 'admin';
    }

    if (link.auth) {
      return Boolean(user);
    }

    return true;
  });

  nav.innerHTML = `
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="/">
        <i class="bi bi-compass-fill text-success"></i>
        <span>SkillBridge</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          ${visibleLinks
            .map(
              (link) => `
                <li class="nav-item">
                  <a class="nav-link ${currentPath === link.href ? 'active' : ''}" href="${link.href}">
                    <i class="bi ${link.icon} me-1"></i>${link.label}
                  </a>
                </li>
              `
            )
            .join('')}
          ${
            user
              ? `
                <li class="nav-item">
                  <span class="nav-link text-secondary">${escapeHtml(user.email)}</span>
                </li>
                <li class="nav-item">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-logout>
                    <i class="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              `
              : `
                <li class="nav-item">
                  <a class="btn btn-outline-dark btn-sm" href="/pages/login.html">Login</a>
                </li>
                <li class="nav-item">
                  <a class="btn btn-success btn-sm" href="/pages/register.html">Register</a>
                </li>
              `
          }
        </ul>
      </div>
    </div>
  `;

  nav.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await signOut();
    window.location.href = '/';
  });
}
