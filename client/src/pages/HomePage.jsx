import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { Spinner } from '../components/UI';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.list({ limit: 8, sort: 'created_at', order: 'DESC' }),
          categoryAPI.list(),
        ]);
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Products</h1>
        <p className="text-text-light max-w-xl mx-auto mb-8">
          Discover our curated collection of high-quality products at the best prices.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Shop Now <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category_id=${cat.id}`}
              className="bg-surface rounded-lg p-6 text-center hover:bg-surface-dark transition-colors"
            >
              <h3 className="font-medium">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Latest Products</h2>
          <Link to="/products" className="text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
