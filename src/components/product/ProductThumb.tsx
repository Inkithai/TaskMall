import type { Product } from '../../data/types'
import { cx } from '../ui/primitives'

function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace('#', '')
  const n = parseInt(
    v.length === 3
      ? v
          .split('')
          .map((c) => c + c)
          .join('')
      : v,
    16,
  )
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * Product thumbnail. Uses the catalog photo when one exists, otherwise a
 * tinted gradient tile with the product glyph so grids never break.
 */
export function ProductThumb({
  product,
  className,
  rounded = 'rounded-xl',
  glyphSize = 'text-3xl',
}: {
  product: Pick<Product, 'name' | 'image' | 'emoji' | 'accent'>
  className?: string
  rounded?: string
  glyphSize?: string
}) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={cx('bg-white object-cover', rounded, className)}
      />
    )
  }

  return (
    <div
      className={cx('flex items-center justify-center overflow-hidden', rounded, className)}
      style={{
        backgroundImage: `linear-gradient(135deg, ${hexToRgba(product.accent, 0.22)} 0%, ${hexToRgba(
          product.accent,
          0.08,
        )} 60%, #ffffff 100%)`,
      }}
      aria-label={product.name}
      role="img"
    >
      <span className={cx('leading-none drop-shadow-sm select-none', glyphSize)}>{product.emoji}</span>
    </div>
  )
}
