import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://navvzhjgwqihdbdallia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdnZ6aGpnd3FpaGRiZGFsbGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzExNzcsImV4cCI6MjA2NDc0NzE3N30.WaZpo0mOYn5tTW-NVN85EcYME05U34kIvpNMRWHS9oA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
