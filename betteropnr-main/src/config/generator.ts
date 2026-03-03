// GENERATOR_CUTOVER: Dedicated endpoint for the generate Edge Function
// hosted on the production Supabase project (separate from Lovable Cloud).
export const GENERATOR_FUNCTIONS_BASE_URL =
  "https://vshitqqftdekgtjanyaa.supabase.co/functions/v1";

const _fallbackKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGl0cXFmdGRla2d0amFueWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzkzNjcsImV4cCI6MjA3OTUxNTM2N30.6Ag8kDoHMLnuqlbqn8JGYVJxNpiDXFkmcGeft-gJ93M";

export const GENERATOR_ANON_KEY: string =
  import.meta.env.VITE_GENERATOR_ANON_KEY || _fallbackKey;

if (!GENERATOR_ANON_KEY) {
  console.error(
    "GENERATOR_ANON_KEY is missing. Set VITE_GENERATOR_ANON_KEY in your environment variables."
  );
}
