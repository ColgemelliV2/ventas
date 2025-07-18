import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btwhvavwqkzifiuhgcao.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d2h2YXZ3cWt6aWZpdWhnY2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTQ0MjYsImV4cCI6MjA2ODQzMDQyNn0.LZnCkY7DkbA-3K9TWOjn23pzDC6ye9Kvl8L8qZsW1Ds';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
