import { requireSupabase } from '../supabaseClient.js';

export async function listCategories() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createCategory(category) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('service_categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
