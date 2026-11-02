/** SDF edge displacement map (R/G channels). Adapted from cocolayuan/liquid-glass (MIT). */

const MAP_CACHE = new Map<string, string>();
const MAX_CACHE = 64;

const clamp255 = (value: number): number =>
    value < 0 ? 0 : value > 255 ? 255 : Math.round(value);

export interface LensDisplacementMapOptions {
    mapWidth: number;
    mapHeight: number;
    lensWidth: number;
    lensHeight: number;
    radius: number;
    rim: number;
    curve: number;
    feather: number;
    bias?: number;
    biasAngle?: number;
    boost?: number;
}

export function buildLensDisplacementMapDataUrl(
    options: LensDisplacementMapOptions
): string {
    const {
        mapWidth,
        mapHeight,
        lensWidth,
        lensHeight,
        radius,
        rim,
        curve,
        feather,
        bias = 0.5,
        biasAngle = 45,
        boost = 0.85,
    } = options;

    const key = JSON.stringify(options);
    const cached = MAP_CACHE.get(key);
    if (cached) {
        return cached;
    }

    const canvas = document.createElement('canvas');
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return '';
    }

    const image = ctx.createImageData(mapWidth, mapHeight);
    const pixels = image.data;
    const angleRad = (biasAngle * Math.PI) / 180;
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    const halfW = lensWidth / 2;
    const halfH = lensHeight / 2;

    const sdf = (x: number, y: number): number => {
        const qx = Math.abs(x - mapWidth / 2) - (halfW - radius);
        const qy = Math.abs(y - mapHeight / 2) - (halfH - radius);
        const ox = Math.max(qx, 0);
        const oy = Math.max(qy, 0);
        return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius;
    };

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const cx = x + 0.5;
            const cy = y + 0.5;
            const s = sdf(cx, cy);
            const gx = sdf(cx + 1, cy) - sdf(cx - 1, cy);
            const gy = sdf(cx, cy + 1) - sdf(cx, cy - 1);
            const len = Math.hypot(gx, gy) || 1;
            const nx = gx / len;
            const ny = gy / len;
            const dir = nx * dirX + ny * dirY;
            const dirWeight = Math.max(0.25, 1 + bias * dir);
            const span = (s < 0 ? rim + feather : rim) * dirWeight;
            let amount = Math.max(0, 1 - Math.abs(s) / span);
            amount =
                amount * amount * amount * (amount * (amount * 6 - 15) + 10);
            amount = Math.pow(amount, curve);
            amount *= Math.max(0.5, 1 + bias * dir * 0.5);

            const i = (y * mapWidth + x) * 4;
            pixels[i] = clamp255(127.5 - nx * amount * 127 * boost);
            pixels[i + 1] = clamp255(127.5 - ny * amount * 127 * boost);
            pixels[i + 2] = 128;
            pixels[i + 3] = 255;
        }
    }

    ctx.putImageData(image, 0, 0);
    const url = canvas.toDataURL('image/png');
    if (MAP_CACHE.size >= MAX_CACHE) {
        const first = MAP_CACHE.keys().next().value;
        if (first) {
            MAP_CACHE.delete(first);
        }
    }
    MAP_CACHE.set(key, url);
    return url;
}
