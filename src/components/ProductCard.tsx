import { Link } from 'react-router-dom'
import { formatPrice } from '@/utils/helpers'
import type { Product } from '@/types'

const COLOR_MAP: Record<string, string> = {
  'Carbon Black': '#0d0d0d',
  'Optic White': '#f5f5f5',
  'Bone': '#e8dcc8',
  'Heather Grey': '#b0b0b0',
  'Olive Sage': '#7a8a6e',
  'Navy Blue': '#1e3a5f',
  'Burgundy': '#6e2c2c',
  'Washed Brown': '#8b7355',
  'Sand Beige': '#d4c5a9',
  'Forest Green': '#2d5a27',
}

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block w-full min-w-0 no-underline"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative w-full overflow-hidden rounded-xl bg-[#f3f3f1]" style={{ aspectRatio: '4 / 5' }}>
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover block group-hover:scale-[1.035] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mz-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>
      <div className="pt-2 sm:pt-3">
        <h3 className="text-xs sm:text-sm font-semibold text-mz-black leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm font-bold text-mz-black mt-0.5">
          {formatPrice(product.base_price)}
        </p>
        {product.available_colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.available_colors.map(colorName => (
              <span
                key={colorName}
                className="w-[10px] h-[10px] rounded-full border border-mz-gray-200"
                style={{ backgroundColor: COLOR_MAP[colorName] || '#ccc' }}
                title={colorName}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
