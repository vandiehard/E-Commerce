import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/format';
import { Star } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-surface overflow-hidden">
        <img
          src={getImageUrl(product.images)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.svg';
          }}
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-text-light uppercase tracking-wide mb-1">{product.category_name}</p>
        <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold">{formatPrice(product.price)}</span>
          {product.avg_rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-text-light">
              <Star className="w-3 h-3 fill-current" /> {parseFloat(product.avg_rating).toFixed(1)}
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-error mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
