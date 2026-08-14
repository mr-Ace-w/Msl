'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { MenuCatalog } from '@/components/menu-catalog';
import { DishModal } from '@/components/dish-modal';
import { CartDrawer } from '@/components/cart-drawer';
import { Footer } from '@/components/footer';

type CartItem = {
  dish: any;
  quantity: number;
};

export function HomeClient({ initialDishes }: { initialDishes: any[] }) {
  const [dishes] = useState<any[]>(initialDishes);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('msl_pizzeria_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('msl_pizzeria_cart', JSON.stringify(newCart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  };

  const handleAddToCart = (dish: any) => {
    const existing = cart.find((item) => item.dish.id === dish.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((item) =>
        item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { dish, quantity: 1 }];
    }
    saveCart(newCart);
    setIsCartOpen(true); // Proactively open cart when item is added
  };

  const handleUpdateQuantity = (dishId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item.dish.id === dishId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCart(newCart);
  };

  const handleRemoveItem = (dishId: string) => {
    const newCart = cart.filter((item) => item.dish.id !== dishId);
    saveCart(newCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Header cartCount={totalItemsCount} onCartClick={() => setIsCartOpen(true)} />

      <main>
        {/* Hero Banner Section */}
        <section className="hero-section">
          <span className="hero-tag">Місце Ситих Людей 🔥</span>
          <h1 className="hero-title">
            Смачна гаряча піца та свіжі суші у <span>Теребовлі</span>
          </h1>
          <p className="hero-desc">
            Відчуйте справжній смак італійської піци з дров'яної печі та свіжих японських роликів. Швидка доставка додому чи офісу.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <a href="#menu" className="button">
              Переглянути меню
            </a>
            <a href="#delivery" className="button secondary">
              Про доставку
            </a>
          </div>
        </section>

        {/* Menu Catalog */}
        <MenuCatalog
          dishes={dishes}
          onAddToCart={handleAddToCart}
          onSelectDish={(dish) => setSelectedDish(dish)}
        />

        {/* Delivery Information Block */}
        <section
          id="delivery"
          style={{
            padding: '80px 4%',
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'radial-gradient(circle at 10% 20%, rgba(220, 38, 38, 0.04) 0%, transparent 60%)',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '48px 32px',
              backdropFilter: 'blur(16px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Доставка та оплата</span>
              <h2 style={{ fontSize: '32px', marginTop: '8px', marginBottom: '16px', color: 'white' }}>Швидка доставка по місту</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '15px' }}>
                Ми цінуємо ваш час, тому прагнемо доставити замовлення максимально швидко. Наші кур'єри використовують термосумки, щоб їжа приїжджала до вас гарячою та свіжою!
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '12px', borderRadius: '12px' }}>
                  ⏱️
                </div>
                <div>
                  <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>Час доставки</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>В межах міста Теребовля: всього 30-45 хвилин.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#f87171', padding: '12px', borderRadius: '12px' }}>
                  💰
                </div>
                <div>
                  <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>Безкоштовна доставка</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>При замовленні на суму від 500 грн доставка безкоштовна.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '12px', borderRadius: '12px' }}>
                  💳
                </div>
                <div>
                  <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>Зручна оплата</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Розраховуйтесь готівкою, карткою при отриманні або на сайті онлайн.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Detail modal for dish */}
      {selectedDish && (
        <DishModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}
