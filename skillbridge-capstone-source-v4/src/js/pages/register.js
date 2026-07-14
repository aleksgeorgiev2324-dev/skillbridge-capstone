import '../app.js';
import { signUp } from '../auth.js';
import { setLoading, showAlert } from '../ui.js';

const form = document.querySelector('#registerForm');
const message = document.querySelector('#registerMessage');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setLoading(submitButton, true, 'Creating...');

  try {
    await signUp({
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value
    });
    showAlert(message, 'Registration successful. Check your email if confirmation is enabled, then login.', 'success');
    form.reset();
  } catch (error) {
    showAlert(message, error.message, 'danger');
  } finally {
    setLoading(submitButton, false);
  }
});
