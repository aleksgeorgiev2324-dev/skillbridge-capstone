import { readFileSync } from 'node:fs';

const envExample = readFileSync('.env.example', 'utf8');
const requiredKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missing = requiredKeys.filter((key) => !envExample.includes(`${key}=`));

if (missing.length) {
  console.error(`Missing keys in .env.example: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('.env.example contains all required Supabase keys.');
