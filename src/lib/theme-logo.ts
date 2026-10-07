import originalLogo from '@images/logo.png';

interface LogoAssets {
  logo: string;
  favicon: string;
}

const assetsByTheme = new Map<string, LogoAssets>();
let activeLogo = originalLogo;
let revision = 0;
let sourcePromise: Promise<HTMLImageElement> | undefined;

function loadSource(): Promise<HTMLImageElement> {
  sourcePromise ??= new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      sourcePromise = undefined;
      reject(new Error('Unable to load app logo'));
    };
    image.src = originalLogo;
  });
  return sourcePromise;
}

function renderLogo(source: HTMLImageElement, primary: string, classic: boolean): LogoAssets | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 320;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(source, 0, 0, 320, 320);
  if (!classic) {
    // Color blending preserves the original lighting and white highlights.
    context.globalCompositeOperation = 'color';
    context.fillStyle = primary;
    context.fillRect(0, 0, 320, 320);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(source, 0, 0, 320, 320);
  }
  const logo = canvas.toDataURL('image/png');
  const faviconCanvas = document.createElement('canvas');
  faviconCanvas.width = faviconCanvas.height = 32;
  const faviconContext = faviconCanvas.getContext('2d');
  if (!faviconContext) return null;
  faviconContext.drawImage(canvas, 0, 0, 32, 32);
  return { logo, favicon: faviconCanvas.toDataURL('image/png') };
}

export function getThemeLogoUrl(): string {
  return activeLogo;
}

export async function updateThemeLogo(themeId: string, primary: string): Promise<void> {
  const requestRevision = ++revision;
  try {
    let assets = assetsByTheme.get(themeId);
    if (!assets) {
      const source = await loadSource();
      const rendered = renderLogo(source, primary, themeId === 'theme_classic');
      if (!rendered) return;
      assets = rendered;
      assetsByTheme.set(themeId, assets);
    }
    // A slow image load must not restore a theme the player has already changed.
    if (requestRevision !== revision) return;
    activeLogo = assets.logo;
    for (const logo of document.querySelectorAll<HTMLImageElement>('.splash-logo')) {
      logo.src = assets.logo;
    }
    for (const favicon of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
      favicon.href = assets.favicon;
      favicon.type = 'image/png';
      favicon.sizes.value = '32x32';
    }
  } catch {
    // Keep the bundled logo when image decoding or canvas export is unavailable.
  }
}
