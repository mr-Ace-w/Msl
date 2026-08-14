'use client';

type DishCardProps = {
  dish: any;
  onAddToCart: (dish: any) => void;
  onSelect: (dish: any) => void;
};

export function DishCard({ dish, onAddToCart, onSelect }: DishCardProps) {
  const primaryImage =
    dish.dish_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ||
    '/favicon.png';

  return (
    <article className="dish-card">
      {dish.is_popular && <span className="dish-badge">Популярне 🔥</span>}
      {dish.is_spicy && <span className="dish-badge spicy">Гостре 🌶️</span>}

      <div className="dish-image-wrapper" onClick={() => onSelect(dish)} style={{ cursor: 'pointer' }}>
        <img src={primaryImage} alt={dish.name} loading="lazy" />
      </div>

      <div className="dish-info">
        <div className="dish-title-row">
          <h3 className="dish-title" onClick={() => onSelect(dish)} style={{ cursor: 'pointer' }}>
            {dish.name}
          </h3>
          <span className="dish-price">{dish.price} ₴</span>
        </div>

        <p className="dish-desc">
          {dish.description || 'Неймовірно смачна страва, приготована зі свіжих інгредієнтів за оригінальним рецептом.'}
        </p>

        <div className="dish-meta">
          {dish.weight && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
              </svg>
              {dish.weight} г
            </span>
          )}
          {dish.size && (
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h8M12 8v8"></path>
              </svg>
              {dish.size}
            </span>
          )}
        </div>

        <div className="dish-actions">
          <button className="button secondary" onClick={() => onSelect(dish)}>
            Деталі
          </button>
          <button
            className="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish);
            }}
            disabled={!dish.is_available}
          >
            {dish.is_available ? 'У кошик' : 'Закінчилось'}
          </button>
        </div>
      </div>
    </article>
  );
}
