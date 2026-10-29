import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://gcuwyedpdpohsruelkqg.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjdXd5ZWRwZHBvaHNydWVsa3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNjAwNDgsImV4cCI6MjEwODgzNjA0OH0.z3u3HzIKpwJllANN7G7tCXGWJxnoUpQYbxfJX0dO-po';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
