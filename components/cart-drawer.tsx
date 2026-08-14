'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type CartItem = {
  dish: any;
  quantity: number;
};

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
};

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [busy, setBusy] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderIdShort, setOrderIdShort] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    deliveryMethod: 'delivery',
    address: '',
    paymentMethod: 'cash',
    comment: '',
  });

  const db = createClient();

  const total = items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    if (form.deliveryMethod === 'delivery' && !form.address.trim()) {
      return alert('Будь ласка, вкажіть адресу доставки');
    }

    setBusy(true);
    try {
      // 1. Insert order
      const { data: order, error: orderErr } = await db
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_phone: form.phone,
          delivery_method: form.deliveryMethod,
          delivery_address: form.deliveryMethod === 'delivery' ? form.address : null,
          payment_method: form.paymentMethod,
          comment: form.comment,
          total_price: total,
          status: 'new',
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        dish_id: item.dish.id,
        dish_name: item.dish.name,
        quantity: item.quantity,
        price_at_order: item.dish.price,
        size_at_order: item.dish.size || null,
      }));

      const { error: itemsErr } = await db.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      setOrderIdShort(order.id.slice(0, 8).toUpperCase());
      setOrdered(true);
      onClearCart();
    } catch (err: any) {
      alert(`Не вдалося оформити замовлення: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'white' }}>Ваш кошик</h2>
          <button className="cart-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {ordered ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', margin: 'auto' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍕🔥</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: 'white' }}>Замовлення прийнято!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              Дякуємо, <b>{form.name}</b>! Наш адміністратор зв'яжеться з вами за номером <b>{form.phone}</b> найближчим часом для підтвердження.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', marginBottom: '32px' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Номер замовлення:</span>
              <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-accent)' }}>#{orderIdShort}</strong>
            </div>
            <button
              className="button"
              onClick={() => {
                setOrdered(false);
                setForm({ name: '', phone: '', deliveryMethod: 'delivery', address: '', paymentMethod: 'cash', comment: '' });
                onClose();
              }}
              style={{ width: '100%' }}
            >
              Продовжити покупки
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Ваш кошик порожній</p>
            <button className="button secondary" onClick={onClose}>Повернутися до меню</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => {
                const img = item.dish.dish_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url || '/favicon.png';
                return (
                  <div className="cart-item" key={item.dish.id}>
                    <img src={img} alt={item.dish.name} />
                    <div className="cart-item-details">
                      <div className="cart-item-title">{item.dish.name}</div>
                      <div className="cart-item-meta">
                        {item.dish.size ? `${item.dish.size} | ` : ''}
                        {item.dish.weight ? `${item.dish.weight} г` : ''}
                      </div>
                      <div className="cart-item-price">{item.dish.price} ₴</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div className="cart-item-quantity">
                        <button onClick={() => onUpdateQuantity(item.dish.id, -1)}>&minus;</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.dish.id, 1)}>+</button>
                      </div>
                      <button className="cart-item-remove" onClick={() => onRemoveItem(item.dish.id)}>
                        Видалити
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Разом до сплати:</span>
                <span className="cart-summary-total">{total} ₴</span>
              </div>

              <form onSubmit={submit} className="checkout-form">
                <div className="form-group">
                  <label htmlFor="checkout-name">Ваше ім'я</label>
                  <input
                    id="checkout-name"
                    type="text"
                    name="name"
                    placeholder="Іван"
                    value={form.name}
                    onChange={change}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-phone">Номер телефону</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    name="phone"
                    placeholder="+380971234567"
                    value={form.phone}
                    onChange={change}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="checkout-delivery">Спосіб доставки</label>
                    <select
                      id="checkout-delivery"
                      name="deliveryMethod"
                      value={form.deliveryMethod}
                      onChange={change}
                    >
                      <option value="delivery">Доставка</option>
                      <option value="pickup">Самовивіз</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="checkout-payment">Оплата</label>
                    <select
                      id="checkout-payment"
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={change}
                    >
                      <option value="cash">Готівка</option>
                      <option value="card_on_delivery">Карткою кур'єру</option>
                      <option value="card_online">Онлайн оплата</option>
                    </select>
                  </div>
                </div>

                {form.deliveryMethod === 'delivery' && (
                  <div className="form-group">
                    <label htmlFor="checkout-address">Адреса доставки</label>
                    <input
                      id="checkout-address"
                      type="text"
                      name="address"
                      placeholder="вул. Шевченка, 10, кв. 5"
                      value={form.address}
                      onChange={change}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="checkout-comment">Коментар до замовлення</label>
                  <textarea
                    id="checkout-comment"
                    name="comment"
                    placeholder="Код дверей, здача з 500 грн тощо..."
                    rows={2}
                    value={form.comment}
                    onChange={change}
                  />
                </div>

                <button
                  className="button"
                  style={{ width: '100%', marginTop: '8px', padding: '16px' }}
                  disabled={busy}
                >
                  {busy ? 'Оформлення…' : 'Підтвердити замовлення'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
