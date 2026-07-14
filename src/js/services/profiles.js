import { requireSupabase } from '../supabaseClient.js';

const AVATAR_BUCKET = 'profile-avatars';

export async function getProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(userId, payload) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadAvatar(file, userId) {
  const client = requireSupabase();
  const extension = file.name.split('.').pop() || 'png';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const { error: uploadError } = await client.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true
  });

  if (uploadError) {
    throw uploadError;
  }

  return path;
}

export async function listProfiles() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, city, created_at, user_roles(role)')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
