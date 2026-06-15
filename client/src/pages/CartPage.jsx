import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/format';
import { Spinner, EmptyState } from '../components/UI';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();

  if (loading) return <Spinner />;

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Add some products to get started"
        action={
          <Link to="/products" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">
            Browse Products
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 border border-border rounded-lg p-4">
            <Link to={`/products/${item.product?.slug}`} className="w-20 h-20 bg-surface rounded-lg overflow-hidden shrink-0">
              <img src={getImageUrl(item.product?.images)} alt={item.product?.name} className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${item.product?.slug}`} className="font-medium text-sm hover:underline line-clamp-1">
                {item.product?.name}
              </Link>
              <p className="text-sm text-text-light mt-1">{formatPrice(item.product?.price)}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-surface">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-surface">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1 text-text-light hover:text-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-sm">{formatPrice(item.product?.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-bold">{formatPrice(cart.total)}</span>
        </div>
        <Link
          to="/checkout"
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
