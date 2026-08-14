'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const db = createClient();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        alert(`Помилка входу: ${error.message}`);
        setBusy(false);
      } else {
        router.replace('/admin');
        router.refresh();
      }
    } catch (err: any) {
      alert(`Непередбачувана помилка: ${err.message}`);
      setBusy(false);
    }
  }

  return (
    <main className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/images/logo1.png" alt="MSL Logo" className="login-logo-img" />
          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'white' }}>
            Вхід в систему
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Введіть ваші дані для доступу до панелі
          </p>
        </div>

        <form onSubmit={handleLogin} className="checkout-form">
          <div className="form-group">
            <label htmlFor="login-email">Електронна пошта</label>
            <input
              id="login-email"
              type="email"
              placeholder="admin@msl.ua"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="button"
            style={{ width: '100%', marginTop: '16px', padding: '14px' }}
            disabled={busy}
          >
            {busy ? 'Вхід в систему…' : 'Увійти в панель'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'underline' }}>
            Повернутися на головну
          </a>
        </div>
      </div>
    </main>
  );
}
