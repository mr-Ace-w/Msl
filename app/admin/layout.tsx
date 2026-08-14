import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await db
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  if (!user || !isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-wrapper">
          <div className="logo-wrapper">
            <img src="/images/logo1.png" alt="MSL Logo" className="logo-img" />
            <div>
              <span className="logo-text">MSL ADMIN</span>
              <span className="logo-sub">Панель керування</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">
            <span>🍕</span> Страви
          </Link>
          <Link href="/admin/orders" className="admin-nav-link">
            <span>📋</span> Замовлення
          </Link>
          <Link href="/" className="admin-nav-link">
            <span>🌐</span> На сайт
          </Link>
        </nav>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
