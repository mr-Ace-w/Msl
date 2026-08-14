'use client';

type DishModalProps = {
  dish: any;
  onClose: () => void;
  onAddToCart: (dish: any) => void;
};

export function DishModal({ dish, onClose, onAddToCart }: DishModalProps) {
  if (!dish) return null;
  const primaryImage =
    dish.dish_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ||
    '/favicon.png';

  const categoryName = (cat: string) => {
    switch (cat) {
      case 'pizza':
        return '🍕 Піца';
      case 'sushi_wok':
        return '🥢 Суші та Wok';
      case 'drinks':
        return '🥤 Напої';
      case 'desserts':
        return '🍰 Десерти';
      default:
        return cat;
    };
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрити">
          &times;
        </button>

        <div className="modal-body-grid">
          <div className="modal-img-column">
            <img src={primaryImage} alt={dish.name} />
          </div>

          <div className="modal-info-column">
            <div className="modal-tags">
              <span className="dish-badge">{categoryName(dish.category)}</span>
              {dish.is_popular && <span className="dish-badge">Популярне 🔥</span>}
              {dish.is_spicy && <span className="dish-badge spicy">Гостре 🌶️</span>}
            </div>

            <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'white' }}>
              {dish.name}
            </h2>
            
            <p style={{ fontSize: '24px', color: 'var(--text-accent)', fontWeight: 'bold' }}>
              {dish.price} ₴
            </p>

            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
              {dish.weight && (
                <div>
                  <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Вага</small>
                  <strong style={{ fontSize: '16px' }}>{dish.weight} г</strong>
                </div>
              )}
              {dish.size && (
                <div>
                  <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Розмір</small>
                  <strong style={{ fontSize: '16px' }}>{dish.size}</strong>
                </div>
              )}
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '6px', fontSize: '15px' }}>Опис та склад:</h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '14px' }}>
                {dish.description || 'Рецептурне поєднання свіжих інгредієнтів найвищої якості. Готується безпосередньо після замовлення.'}
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button
                className="button"
                style={{ width: '100%', padding: '14px 20px', fontSize: '16px' }}
                onClick={() => {
                  onAddToCart(dish);
                  onClose();
                }}
                disabled={!dish.is_available}
              >
                {dish.is_available ? `Додати до кошика за ${dish.price} ₴` : 'Немає в наявності'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
