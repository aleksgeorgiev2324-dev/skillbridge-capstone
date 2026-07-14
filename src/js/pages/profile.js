import '../app.js';
import { requireAuth } from '../auth.js';
import { getProfile, updateProfile, uploadAvatar } from '../services/profiles.js';
import { setLoading, showAlert } from '../ui.js';

const form = document.querySelector('#profileForm');
const message = document.querySelector('#profileMessage');
let currentUser = null;

async function init() {
  currentUser = await requireAuth();
  if (!currentUser) {
    return;
  }

  try {
    const profile = await getProfile(currentUser.id);
    form.fullName.value = profile.full_name || '';
    form.city.value = profile.city || '';
    form.bio.value = profile.bio || '';
    form.phone.value = profile.phone || '';
  } catch (error) {
    showAlert(message, error.message, 'danger');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setLoading(submitButton, true, 'Saving...');

  try {
    let avatarPath;
    if (form.avatar.files[0]) {
      avatarPath = await uploadAvatar(form.avatar.files[0], currentUser.id);
    }

    await updateProfile(currentUser.id, {
      full_name: form.fullName.value.trim(),
      city: form.city.value.trim(),
      bio: form.bio.value.trim(),
      phone: form.phone.value.trim(),
      ...(avatarPath ? { avatar_path: avatarPath } : {})
    });
    showAlert(message, 'Profile saved.', 'success');
  } catch (error) {
    showAlert(message, error.message, 'danger');
  } finally {
    setLoading(submitButton, false);
  }
});

await init();
