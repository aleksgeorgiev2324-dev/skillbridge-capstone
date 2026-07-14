import { requireSupabase } from '../supabaseClient.js';

export async function listReviews(listingId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('reviews')
    .select('*, profiles!reviews_reviewer_id_fkey(full_name)')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createReview(payload) {
  const client = requireSupabase();
  const { data, error } = await client.from('reviews').insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
}
