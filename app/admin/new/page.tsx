import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DishEditor } from '../dish-editor';

export const dynamic = 'force-dynamic';

export default async function NewDishPage() {
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

  return <DishEditor />;
}
