import { requireSupabase, supabase } from './supabaseClient.js';

export async function getSession() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const redirectTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.href = `/pages/login.html?redirect=${redirectTo}`;
    return null;
  }

  return user;
}

export async function signIn(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return data.user;
}

export async function signUp({ email, password, fullName }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    throw error;
  }

  if (data.user && data.session) {
    await ensureProfile(data.user, fullName);
  }

  return data.user;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function ensureProfile(user, fullName = '') {
  const client = requireSupabase();
  const { error } = await client.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName || user.user_metadata?.full_name || user.email,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }
}

export async function getUserRole(userId) {
  if (!userId) {
    return 'guest';
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role || 'user';
}

export async function isAdmin(userId) {
  return (await getUserRole(userId)) === 'admin';
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) {
    return null;
  }

  if (!(await isAdmin(user.id))) {
    window.location.href = '/pages/dashboard.html';
    return null;
  }

  return user;
}
