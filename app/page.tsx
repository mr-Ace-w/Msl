import { getDishes } from '@/lib/dishes';
import { HomeClient } from './home-client';
import fs from 'fs';
import path from 'path';

export const revalidate = 10; // Revalidate cache every 10s
export const dynamic = 'force-dynamic';

function autoCopyAssets() {
  try {
    const tempDir = 'C:\\Users\\illia\\.gemini\\antigravity\\brain\\tempmediaStorage';
    const convDir = 'C:\\Users\\illia\\.gemini\\antigravity\\brain\\b94eab43-088d-4a41-b9d2-dcc750058aa6';
    const targetLogo = 'E:\\MSL\\public\\images\\logo1.png';
    const targetIcon = 'E:\\MSL\\app\\icon.png';
    const targetPizza = 'E:\\MSL\\public\\images\\hero_pizza.jpg';
    const targetSushi = 'E:\\MSL\\public\\images\\sushi_rolls.jpg';

    // Ensure public/images directory exists
    fs.mkdirSync('E:\\MSL\\public\\images', { recursive: true });

    // Copy logo PNG from temp upload folder
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const pngFiles = files.filter((f) => f.endsWith('.png'));

      if (pngFiles.length > 0) {
        const stats = pngFiles
          .map((f) => {
            const p = path.join(tempDir, f);
            const s = fs.statSync(p);
            return { file: f, path: p, time: s.mtimeMs, size: s.size };
          })
          .sort((a, b) => b.time - a.time);

        // Logo is smaller (< 800KB), screenshots are much larger (1MB+)
        const logoCandidate = stats.find((s) => s.size < 800000);
        if (logoCandidate) {
          if (!fs.existsSync(targetLogo) || fs.statSync(targetLogo).size !== logoCandidate.size) {
            fs.copyFileSync(logoCandidate.path, targetLogo);
          }
          if (!fs.existsSync(targetIcon) || fs.statSync(targetIcon).size !== logoCandidate.size) {
            fs.copyFileSync(logoCandidate.path, targetIcon);
          }
        }
      }
    }

    // Copy generated food assets from conversation directory
    if (fs.existsSync(convDir)) {
      const convFiles = fs.readdirSync(convDir);

      const pizzaFile = convFiles.find((f) => f.startsWith('hero_pizza') && f.endsWith('.jpg'));
      if (pizzaFile && !fs.existsSync(targetPizza)) {
        fs.copyFileSync(path.join(convDir, pizzaFile), targetPizza);
      }

      const sushiFile = convFiles.find((f) => f.startsWith('sushi_rolls') && f.endsWith('.jpg'));
      if (sushiFile && !fs.existsSync(targetSushi)) {
        fs.copyFileSync(path.join(convDir, sushiFile), targetSushi);
      }
    }
  } catch (e) {
    console.error('Auto-copy assets failed:', e);
  }
}

export default async function Home() {
  autoCopyAssets();
  const dishes = await getDishes();
  return <HomeClient initialDishes={dishes} />;
}
