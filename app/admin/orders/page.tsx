import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrdersClient } from './orders-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
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

  const { data: orders } = await db
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return <OrdersClient initialOrders={orders || []} />;
}
