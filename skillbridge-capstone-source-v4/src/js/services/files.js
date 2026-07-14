import { requireSupabase } from '../supabaseClient.js';

const BUCKET = 'listing-files';

function cleanFileName(name) {
  return name.replace(/[^a-z0-9.\-_]/gi, '-').toLowerCase();
}

export async function uploadListingFiles(files, listingId, userId) {
  const client = requireSupabase();
  const uploaded = [];

  for (const file of files) {
    const path = `${userId}/${listingId}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;
    const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data, error } = await client
      .from('listing_files')
      .insert({
        listing_id: listingId,
        owner_id: userId,
        bucket_name: BUCKET,
        file_path: path,
        file_name: file.name,
        content_type: file.type || 'application/octet-stream',
        file_size: file.size
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    uploaded.push(data);
  }

  return uploaded;
}

export async function listListingFiles(listingId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('listing_files')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createDownloadUrl(filePath) {
  const client = requireSupabase();
  const { data, error } = await client.storage.from(BUCKET).createSignedUrl(filePath, 120);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
