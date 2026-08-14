import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Піцерія MSL | Місце Ситих Людей у Теребовлі',
    template: '%s | Піцерія MSL',
  },
  description: 'Найкраща гаряча піца, суші та wok у місті Теребовля. Швидка доставка смачної їжі за адресою вул. Гжицького, 2. Замовляйте онлайн! 🍕🔥',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
