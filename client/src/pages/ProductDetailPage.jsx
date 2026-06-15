import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl, formatDate } from '../utils/format';
import { Spinner } from '../components/UI';
import ProductCard from '../components/ProductCard';
import { Star, ShoppingCart, Minus, Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getBySlug(slug);
        setProduct(res.data.data);
        const revRes = await reviewAPI.getByProduct(res.data.data.id);
        setReviews(revRes.data.data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    await addToCart(product.id, qty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.create({ product_id: product.id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      const revRes = await reviewAPI.getByProduct(product.id);
      setReviews(revRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-light mb-6">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:underline">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary">{product.name}</span>
      </nav>

      {/* Product */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Image */}
        <div className="aspect-square bg-surface rounded-lg overflow-hidden">
          <img
            src={getImageUrl(images)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm text-text-light uppercase tracking-wide mb-2">{product.category_name}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.avg_rating > 0 && (
              <span className="flex items-center gap-1 text-sm text-text-light">
                <Star className="w-4 h-4 fill-current" />
                {parseFloat(product.avg_rating).toFixed(1)} ({product.review_count} reviews)
              </span>
            )}
          </div>

          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-text-light leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity & Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-surface">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2 hover:bg-surface">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="border-t border-border pt-8">
        <h2 className="text-xl font-bold mb-6">Reviews ({product.review_count || reviews.length})</h2>

        {/* Review form */}
        {user && (
          <form onSubmit={handleReviewSubmit} className="bg-surface rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Write a Review</h3>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                >
                  <Star className={`w-5 h-5 ${star <= reviewForm.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none mb-3 resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-text-light text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.user?.name}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-text-light">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && <p className="text-sm text-text-light">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <section className="border-t border-border pt-8 mt-8">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
