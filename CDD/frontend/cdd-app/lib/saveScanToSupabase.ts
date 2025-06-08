import { supabase } from './supabase';

export const saveScanToSupabase = async ({
  imageUrl,
  prediction,
  confidence,
  latitude,
  longitude,
  name,
  municipality,
  barangay,
}: {
  imageUrl: string;
  prediction: string;
  confidence: number;
  latitude: number;
  longitude: number;
  name: string;
  municipality: string;
  barangay: string;
}) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated. Please log in.');
  }

  const { error } = await supabase.from('scans').insert([
    {
      user_id: user.id,
      image_url: imageUrl,
      prediction,
      confidence,
      latitude,
      longitude,
      name,
      municipality,
      barangay,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
};
