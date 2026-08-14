import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DishEditor } from '../dish-editor';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDishPage({ params }: PageProps) {
  const { id } = await params;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await db
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');

  const { data: dish } = await db
    .from('dishes')
    .select('*, dish_images(*)')
    .eq('id', id)
    .single();

  if (!dish) redirect('/admin');

  return <DishEditor dish={dish} />;
}
