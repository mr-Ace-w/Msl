'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

type Image = { id: string; url: string; position: number };
const storageMarker = '/storage/v1/object/public/dish-images/';

export function DishEditor({ dish }: { dish?: any }) {
  const router = useRouter();
  const db = createClient();
  const initialImages: Image[] = (dish?.dish_images ?? []).sort(
    (a: Image, b: any) => a.position - b.position
  );

  const [images, setImages] = useState<Image[]>(initialImages);
  const [busy, setBusy] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);

  const [form, setForm] = useState<any>({
    name: dish?.name ?? '',
    price: dish?.price ?? '',
    category: dish?.category ?? 'pizza',
    weight: dish?.weight ?? '',
    size: dish?.size ?? '',
    description: dish?.description ?? '',
    is_available: dish?.is_available ?? true,
    is_popular: dish?.is_popular ?? false,
    is_spicy: dish?.is_spicy ?? false,
  });

  function change(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setForm({ ...form, [name]: target.checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function move(from: number, to: number) {
    if (from === to) return;
    setImages((current) => {
      const next = [...current];
      const [image] = next.splice(from, 1);
      next.splice(to, 0, image);
      return next;
    });
  }

  async function uploadFiles(list: FileList | null) {
    if (!list) return;
    if (images.length + list.length > 50) return alert('Максимум 50 фото');
    setBusy(true);
    try {
      const uploaded: Image[] = [];
      for (const file of Array.from(list)) {
        const blob = await webp(file);
        const ext = blob.type.split('/')[1] || 'webp';
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await db.storage
          .from('dish-images')
          .upload(path, blob, { contentType: blob.type });

        if (error) throw error;
        const { data } = db.storage.from('dish-images').getPublicUrl(path);

        uploaded.push({
          id: crypto.randomUUID(),
          url: data.publicUrl,
          position: images.length + uploaded.length,
        });
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeOrphanedFiles() {
    const paths = initialImages
      .map((image) => image.url)
      .filter(
        (url) =>
          url.includes(storageMarker) &&
          !images.some((current) => current.url === url)
      )
      .map((url) => decodeURIComponent(url.split(storageMarker)[1]));

    if (paths.length) {
      const { error } = await db.storage.from('dish-images').remove(paths);
      if (error) console.warn('Storage cleanup failed:', error.message);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const row = {
        ...form,
        price: +form.price,
        weight: form.weight ? +form.weight : null,
        size: form.size.trim() || null,
      };

      const result = dish
        ? await db.from('dishes').update(row).eq('id', dish.id).select().single()
        : await db.from('dishes').insert(row).select().single();

      if (result.error) throw result.error;

      // Delete previous image entries
      const removed = await db.from('dish_images').delete().eq('dish_id', result.data.id);
      if (removed.error) throw removed.error;

      // Insert new image entries in active order
      if (images.length) {
        const inserted = await db.from('dish_images').insert(
          images.map((image, position) => ({
            dish_id: result.data.id,
            url: image.url,
            position,
          }))
        );
        if (inserted.error) throw inserted.error;
      }

      await removeOrphanedFiles();
      router.replace('/admin');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setBusy(false);
    }
  }

  return (
    <main className="editor-container">
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'white', marginBottom: '24px' }}>
        {dish ? 'Редагування страви' : 'Створення нової страви'}
      </h1>

      <form onSubmit={save} className="editor-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Назва страви</label>
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Маргарита, Філадельфія..."
              required
            />
          </div>

          <div className="form-group">
            <label>Ціна (₴)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={change}
              placeholder="150"
              required
            />
          </div>

          <div className="form-group">
            <label>Категорія</label>
            <select
              name="category"
              value={form.category}
              onChange={change}
              required
            >
              <option value="pizza">🍕 Піца</option>
              <option value="sushi_wok">🥢 Суші та Wok</option>
              <option value="drinks">🥤 Напої</option>
              <option value="desserts">🍰 Десерти</option>
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Вага (г)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={change}
                placeholder="400"
              />
            </div>
            <div className="form-group">
              <label>Розмір / Об'єм</label>
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={change}
                placeholder="30 см, 0.5 л"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Опис страви (складники)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            placeholder="Томатний соус, моцарела, базилік, оливкова олія..."
            rows={4}
          />
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_available"
              checked={form.is_available}
              onChange={change}
            />
            В наявності (доступно для замовлення)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_popular"
              checked={form.is_popular}
              onChange={change}
            />
            Популярна страва 🔥
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_spicy"
              checked={form.is_spicy}
              onChange={change}
            />
            Гостра страва 🌶️
          </label>
        </div>

        {/* Drag and drop image uploader */}
        <div className="form-group">
          <label>Фотографії страви</label>
          <label
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              uploadFiles(e.dataTransfer.files);
            }}
          >
            Перетягніть фото сюди або натисніть для вибору
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => uploadFiles(e.target.files)}
            />
          </label>

          <div className="photo-list">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="photo-item"
                draggable
                onDragStart={() => setDragged(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragged !== null) move(dragged, index);
                  setDragged(null);
                }}
              >
                <img src={image.url} alt="" />
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) =>
                      current.filter((item) => item !== image)
                    )
                  }
                  aria-label="Видалити фото"
                >
                  &times;
                </button>
                <div className="photo-item-controls">
                  <button
                    type="button"
                    disabled={!index}
                    onClick={() => move(index, index - 1)}
                  >
                    &larr;
                  </button>
                  <span style={{ fontSize: '10px', color: 'white' }}>
                    {index === 0 ? 'Головне' : index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <button className="button" style={{ flexGrow: 1 }} disabled={busy}>
            {busy ? 'Збереження…' : 'Зберегти страву'}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => router.push('/admin')}
            disabled={busy}
          >
            Скасувати
          </button>
        </div>
      </form>
    </main>
  );
}

async function webp(file: File) {
  let width = 0,
    height = 0,
    draw: (ctx: CanvasRenderingContext2D) => void;
  try {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    draw = (ctx) => ctx.drawImage(bitmap, 0, 0);
  } catch (e) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(err);
        image.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
    width = img.width;
    height = img.height;
    draw = (ctx) => ctx.drawImage(img, 0, 0);
  }
  const max = 1200,
    scale = Math.min(1, max / Math.max(width, height)),
    canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  draw(ctx);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else {
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Не вдалося стиснути фото'));
            },
            'image/jpeg',
            0.85
          );
        }
      },
      'image/webp',
      0.82
    );
  });
}
