import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twhpxhnukyvhplphiflm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aHB4aG51a3l2aHBscGhpZmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Njg0ODUsImV4cCI6MjA2NDU0NDQ4NX0.LCqnMBhh_yIajrvuP7M8A0qUyApmVIgqmxGx0KUwMTU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
