import { requireSupabase } from '../supabaseClient.js';

export async function createBooking(payload) {
  const client = requireSupabase();
  const { data, error } = await client.from('booking_requests').insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listIncomingBookings(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('booking_requests')
    .select('*, listings(title), profiles!booking_requests_customer_id_fkey(full_name)')
    .eq('provider_id', userId)
    .order('scheduled_for', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function listOutgoingBookings(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('booking_requests')
    .select('*, listings(title), profiles!booking_requests_provider_id_fkey(full_name)')
    .eq('customer_id', userId)
    .order('scheduled_for', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateBookingStatus(id, status) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('booking_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function adminListBookings() {
  const client = requireSupabase();
  const { data, error } = await client.from('booking_requests').select('id');

  if (error) {
    throw error;
  }

  return data || [];
}
