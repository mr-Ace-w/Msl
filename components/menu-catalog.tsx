'use client';
import { useState, useMemo } from 'react';
import { DishCard } from './dish-card';

type MenuCatalogProps = {
  dishes: any[];
  onAddToCart: (dish: any) => void;
  onSelectDish: (dish: any) => void;
};

export function MenuCatalog({ dishes, onAddToCart, onSelectDish }: MenuCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: '✨ Усі страви' },
    { id: 'pizza', label: '🍕 Піца' },
    { id: 'sushi_wok', label: '🥢 Суші та Wok' },
    { id: 'drinks', label: '🥤 Напої' },
    { id: 'desserts', label: '🍰 Десерти' },
  ];

  const filtered = useMemo(() => {
    return dishes.filter((dish) => {
      const matchCat = activeCategory === 'all' || dish.category === activeCategory;
      const matchSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [dishes, activeCategory, searchQuery]);

  return (
    <section className="catalog-container" id="menu">
      <div className="catalog-head">
        <h2 style={{ fontSize: '38px', textAlign: 'center', marginBottom: '8px', color: 'white' }}>
          Скуштуйте наші кулінарні шедеври
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '16px', fontSize: '15px' }}>
          Кожна страва готується індивідуально після вашого замовлення
        </p>

        <div className="catalog-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="catalog-search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Пошук улюбленої страви (наприклад: Карбонара, пеппероні, сік...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '18px' }}>За вашим запитом страв не знайдено.</p>
        </div>
      ) : (
        <div className="dish-grid">
          {filtered.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onAddToCart={onAddToCart}
              onSelect={onSelectDish}
            />
          ))}
        </div>
      )}
    </section>
  );
}
