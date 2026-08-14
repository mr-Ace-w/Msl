import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieToSet = { name: string; value: string; options: Record<string, unknown> };

export async function createClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return jar.getAll();
        },
        setAll(items: CookieToSet[]) {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
