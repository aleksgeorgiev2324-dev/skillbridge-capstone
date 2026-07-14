import '../app.js';
import { signIn } from '../auth.js';
import { getQueryParam, setLoading, showAlert } from '../ui.js';

const form = document.querySelector('#loginForm');
const message = document.querySelector('#loginMessage');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  setLoading(submitButton, true, 'Logging in...');

  try {
    await signIn(form.email.value, form.password.value);
    window.location.href = getQueryParam('redirect') || '/pages/dashboard.html';
  } catch (error) {
    showAlert(message, error.message, 'danger');
  } finally {
    setLoading(submitButton, false);
  }
});
