const PLACEHOLDER_URL = 'https://your-project-ref.supabase.co';

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};

export function isSupabaseConfigured() {
  return Boolean(
    config.supabaseUrl &&
      config.supabaseAnonKey &&
      config.supabaseUrl !== PLACEHOLDER_URL &&
      !config.supabaseAnonKey.includes('your-public-anon-key')
  );
}

export function showConfigWarnings() {
  if (isSupabaseConfigured()) {
    return;
  }

  document.querySelectorAll('[data-config-alert]').forEach((element) => {
    element.className = 'alert alert-info';
    element.classList.remove('d-none');
    element.textContent =
      'Demo preview mode: add your Supabase URL and anon key in .env to load real app data.';
  });
}
