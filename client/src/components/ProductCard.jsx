import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/format';
import { Star, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group glass rounded-2xl overflow-hidden card-lift block"
    >
      <div className="aspect-square bg-white/40 overflow-hidden relative">
        <img
          src={getImageUrl(product.images)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.svg';
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full text-sm font-medium text-gray-900 shadow-lg">
            <ShoppingBag className="w-4 h-4" /> View Details
          </span>
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-medium text-gray-700">
            {product.category_name}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(product.price)}</span>
          {product.avg_rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-text-light bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {parseFloat(product.avg_rating).toFixed(1)}
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-error mt-2 font-medium bg-red-50 inline-block px-2 py-0.5 rounded-full">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
