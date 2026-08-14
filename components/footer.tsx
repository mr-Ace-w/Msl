import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer" id="contacts">
      <div className="footer-grid">
        <div className="footer-column">
          <div className="logo-wrapper" style={{ marginBottom: '8px' }}>
            <img src="/images/logo1.png" alt="MSL Logo" className="logo-img" />
            <div>
              <span className="logo-text">MSL PIZZERIA</span>
              <span className="logo-sub">Місце ситих людей</span>
            </div>
          </div>
          <p style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Затишна кафе-піцерія у серці Теребовлі. Випікаємо справжню піцу з любов'ю та доставляємо гарячою прямо до ваших дверей.
          </p>
        </div>

        <div className="footer-column">
          <h3>Контакти</h3>
          <ul>
            <li>
              <strong>Адреса:</strong> м. Теребовля, вул. Гжицького, 2 (біля Укрпошти)
            </li>
            <li>
              <strong>Телефон:</strong> <a href="tel:+380682236054" style={{ color: 'var(--text-accent)' }}>+38 (068) 223-60-54</a>
            </li>
            <li>
              <strong>Години роботи:</strong> Щодня з 10:00 до 21:00
            </li>
          </ul>
        </div>

        <div className="admin-hidden-section" style={{ display: 'none' }}>
          {/* Hidden link for developer convenience if needed, but not rendered in visual tree */}
        </div>
        <div className="footer-column">
          <h3>Навігація</h3>
          <ul>
            <li><a href="#menu">Меню страв</a></li>
            <li><a href="#delivery">Умови доставки</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Соціальні мережі</h3>
          <p style={{ fontSize: '14px', marginBottom: '12px' }}>Слідкуйте за нашими акціями та новинками:</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="https://www.instagram.com/msl_pizzeria/" target="_blank" rel="noopener noreferrer" className="button secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Instagram
            </a>
            <a href="https://www.instagram.com/media_msl_/" target="_blank" rel="noopener noreferrer" className="button secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Media MSL
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MSL Pizzeria (Місце ситих людей). Всі права захищені.</p>
        <p style={{ fontSize: '11px', marginTop: '6px', color: 'rgba(255,255,255,0.15)' }}>
          Designed & Developed by Vynnytsky.
        </p>
      </div>
    </footer>
  );
}
