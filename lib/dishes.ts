import { createClient } from './supabase/server';

export async function getDishes() {
  const db = await createClient();
  const { data, error } = await db
    .from('dishes')
    .select('*, dish_images(*)')
    .order('is_available', { ascending: false })
    .order('is_popular', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching dishes:', error);
    return [];
  }
  return data || [];
}

export async function getDish(id: string) {
  const db = await createClient();
  const { data, error } = await db
    .from('dishes')
    .select('*, dish_images(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching dish ${id}:`, error);
    return null;
  }
  return data;
}
