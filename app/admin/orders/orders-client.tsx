'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type Order = any;

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState('active');
  const db = createClient();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { data, error } = await db
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) return alert(`Помилка оновлення статусу: ${error.message}`);
    
    setOrders((current) =>
      current.map((o) => (o.id === orderId ? { ...o, status: data.status } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return ['new', 'preparing', 'delivering'].includes(o.status);
    }
    return o.status === statusFilter;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Нове';
      case 'preparing':
        return 'Готується';
      case 'delivering':
        return 'Доставляється';
      case 'completed':
        return 'Виконано';
      case 'cancelled':
        return 'Скасовано';
      default:
        return status;
    }
  };

  return (
    <main className="admin">
      <div className="admin-head">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'white' }}>Замовлення клієнтів</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`button ${statusFilter === 'active' ? '' : 'secondary'}`} 
            onClick={() => setStatusFilter('active')}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Активні
          </button>
          <button 
            className={`button ${statusFilter === 'new' ? '' : 'secondary'}`} 
            onClick={() => setStatusFilter('new')}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Нові
          </button>
          <button 
            className={`button ${statusFilter === 'completed' ? '' : 'secondary'}`} 
            onClick={() => setStatusFilter('completed')}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Виконані
          </button>
          <button 
            className={`button ${statusFilter === 'all' ? '' : 'secondary'}`} 
            onClick={() => setStatusFilter('all')}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Всі
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Немає замовлень у цій категорії.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <span className="order-id">Замовлення #{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="order-date" style={{ marginLeft: '16px' }}>
                    {new Date(order.created_at).toLocaleString('uk-UA')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`order-status-badge ${order.status}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <select
                    className="order-status-select"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="new">🆕 Нове</option>
                    <option value="preparing">🍳 Готується</option>
                    <option value="delivering">🛵 Доставляється</option>
                    <option value="completed">✅ Виконано</option>
                    <option value="cancelled">❌ Скасовано</option>
                  </select>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-details-column">
                  <p>
                    <span>Клієнт:</span> {order.customer_name}
                  </p>
                  <p>
                    <span>Телефон:</span>{' '}
                    <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--text-accent)', textDecoration: 'underline' }}>
                      {order.customer_phone}
                    </a>
                  </p>
                  <p>
                    <span>Тип доставки:</span>{' '}
                    {order.delivery_method === 'delivery' ? '🚗 Доставка кур\'єром' : '🚶 Самовивіз'}
                  </p>
                  {order.delivery_method === 'delivery' && (
                    <p>
                      <span>Адреса доставки:</span> {order.delivery_address}
                    </p>
                  )}
                  <p>
                    <span>Оплата:</span>{' '}
                    {order.payment_method === 'cash'
                      ? '💵 Готівка'
                      : order.payment_method === 'card_on_delivery'
                      ? '💳 Карткою при отриманні'
                      : '🌐 Онлайн оплата'}
                  </p>
                  {order.comment && (
                    <p>
                      <span>Коментар:</span> <i style={{ color: '#d1d5db' }}>"{order.comment}"</i>
                    </p>
                  )}
                </div>

                <div className="order-items-column">
                  <h4 style={{ color: 'white', marginBottom: '8px', fontSize: '15px' }}>Склад замовлення:</h4>
                  <div className="order-items-list">
                    {order.order_items?.map((item: any) => (
                      <div className="order-item-row" key={item.id}>
                        <span>
                          <b>{item.dish_name}</b> {item.size_at_order ? `(${item.size_at_order})` : ''}
                        </span>
                        <span>
                          {item.quantity} шт &times; {item.price_at_order} ₴
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        display: 'flex',
                        justify-content: 'between',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '8px',
                        marginTop: '8px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'white',
                      }}
                    >
                      <span style={{ flexGrow: 1 }}>Сума:</span>
                      <span style={{ color: 'var(--text-accent)' }}>{order.total_price} ₴</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
