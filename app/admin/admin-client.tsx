'use client';
import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Row = any;

export function AdminClient({ initialDishes }: { initialDishes: Row[] }) {
  const [dishes, setDishes] = useState(initialDishes);
  const [q, setQ] = useState('');
  const db = createClient();
  const router = useRouter();

  const list = useMemo(() => {
    return dishes.filter((d) =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      (d.category && d.category.toLowerCase().includes(q.toLowerCase()))
    );
  }, [dishes, q]);

  async function flag(id: string, key: string, value: boolean) {
    const { data, error } = await db
      .from('dishes')
      .update({ [key]: value })
      .eq('id', id)
      .select()
      .single();

    if (error) return alert(error.message);
    setDishes((x) => x.map((d) => (d.id === id ? { ...d, ...data } : d)));
  }

  async function remove(id: string) {
    if (!confirm('Видалити страву без можливості відновлення?')) return;
    const { error } = await db.from('dishes').delete().eq('id', id);
    if (error) return alert(error.message);
    setDishes((x) => x.filter((d) => d.id !== id));
  }

  async function handleLogout() {
    await db.auth.signOut();
    router.replace('/');
    router.refresh();
  }

  const categoryName = (cat: string) => {
    switch (cat) {
      case 'pizza':
        return 'Піца';
      case 'sushi_wok':
        return 'Суші / Wok';
      case 'drinks':
        return 'Напої';
      case 'desserts':
        return 'Десерти';
      default:
        return cat;
    }
  };

  return (
    <main className="admin">
      <div className="admin-head">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'white' }}>Управління меню</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="button" href="/admin/new">
            + Додати страву
          </Link>
          <button className="button danger" onClick={handleLogout}>
            Вихід
          </button>
        </div>
      </div>

      <input
        className="admin-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Пошук страви за назвою або категорією..."
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Не знайдено жодної страви.
          </div>
        ) : (
          list.map((dish) => {
            const img =
              dish.dish_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ||
              '/favicon.png';
            return (
              <article className="admin-row" key={dish.id}>
                <img src={img} alt="" />
                <div className="admin-row-info">
                  <b>{dish.name}</b>
                  <small>
                    Категорія: {categoryName(dish.category)} | Ціна: {dish.price} ₴ |{' '}
                    {dish.weight ? `Вага: ${dish.weight} г | ` : ''}
                    {dish.size ? `Розмір: ${dish.size} | ` : ''}
                    Створено: {new Date(dish.created_at).toLocaleDateString('uk-UA')}
                  </small>
                </div>
                <div className="admin-row-toggles">
                  <label>
                    <input
                      type="checkbox"
                      checked={dish.is_available}
                      onChange={(e) => flag(dish.id, 'is_available', e.target.checked)}
                    />{' '}
                    В наявності
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={dish.is_popular}
                      onChange={(e) => flag(dish.id, 'is_popular', e.target.checked)}
                    />{' '}
                    Популярне
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={dish.is_spicy}
                      onChange={(e) => flag(dish.id, 'is_spicy', e.target.checked)}
                    />{' '}
                    Гостре 🌶️
                  </label>
                </div>
                <div className="admin-actions-group">
                  <Link className="button secondary" href={`/admin/${dish.id}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
                    Редагувати
                  </Link>
                  <button className="button danger" onClick={() => remove(dish.id)} style={{ padding: '8px 16px', fontSize: '14px' }}>
                    Видалити
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
