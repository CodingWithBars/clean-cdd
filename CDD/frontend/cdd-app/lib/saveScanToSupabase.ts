// lib/saveScanToSupabase.ts

import { supabase } from './supabase';

export const saveScanToSupabase = async ({
  imageUrl,
  prediction,
  confidence,
  latitude,
  longitude,
}: {
  imageUrl: string;
  prediction: string;
  confidence: number;
  latitude: number;
  longitude: number;
}) => {
  const userResult = await supabase.auth.getUser();
  const user = userResult.data?.user;

  if (!user) {
    throw new Error('User not authenticated. Please log in.');
  }

  const { error } = await supabase.from('scans').insert({
    user_id: user.id,
    image_url: imageUrl,
    prediction,
    confidence,
    latitude,
    longitude,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
};
