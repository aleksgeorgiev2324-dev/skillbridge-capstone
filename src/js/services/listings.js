import { requireSupabase } from '../supabaseClient.js';

const LISTING_SELECT = `
  *,
  service_categories(name, slug),
  profiles!listings_owner_id_fkey(full_name, city, avatar_path)
`;

export async function listPublishedListings({ search = '', categoryId = '' } = {}) {
  const client = requireSupabase();
  let query = client
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data || [];
}

export async function getListing(id) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listMyListings(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('listings')
    .select('*, service_categories(name)')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createListing(payload) {
  const client = requireSupabase();
  const { data, error } = await client.from('listings').insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateListing(id, payload) {
  const client = requireSupabase();
  const { data, error } = await client.from('listings').update(payload).eq('id', id).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteListing(id) {
  const client = requireSupabase();
  const { error } = await client.from('listings').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function adminListListings() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('listings')
    .select(LISTING_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateListingStatus(id, status) {
  return updateListing(id, { status, updated_at: new Date().toISOString() });
}
