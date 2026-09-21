/**
 * Placeholder embebido (SVG como data URI) para modelos sin imagen disponible.
 * Se usa un data URI para que funcione incluso sin conexión o si el backend
 * no puede servir el archivo en /uploads.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <rect width="160" height="160" fill="#0f172a" />
  <path d="M40 78h60v24H40z" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
  <path d="M100 86h16l10 10v6h-26z" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
  <circle cx="58" cy="108" r="8" fill="none" stroke="#475569" stroke-width="4" />
  <circle cx="112" cy="108" r="8" fill="none" stroke="#475569" stroke-width="4" />
  <text x="80" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Sin imagen</text>
</svg>`;

export const IMAGEN_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(svg)}`;
