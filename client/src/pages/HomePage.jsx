import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, BookOpen, Cpu, Shirt, Home, Dumbbell, Sparkles, TrendingUp, Shield, Truck } from 'lucide-react';

const categoryIcons = {
  books: BookOpen,
  electronics: Cpu,
  fashion: Shirt,
  'home & living': Home,
  'home': Home,
  sports: Dumbbell,
};

function getIcon(name) {
  const key = name.toLowerCase();
  return categoryIcons[key] || Sparkles;
}

const categoryGradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-indigo-500 to-blue-500',
];

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
      } catch (e) {
        console.error('Failed to load homepage data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-28 px-4 text-center">
        {/* Decorative floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-purple-300/30 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-20 right-16 w-14 h-14 rounded-full bg-pink-300/30 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-12 left-1/4 w-16 h-16 rounded-full bg-blue-300/30 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 right-1/3 w-10 h-10 rounded-full bg-amber-300/30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto fade-in-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium text-purple-700 mb-6">
            <Sparkles className="w-4 h-4" />
            Welcome to Ree-Store
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            <span className="gradient-text">Ree-Store</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Where Style Meets Substance
          </p>
          <p className="text-text-light text-lg md:text-xl max-w-xl mx-auto mb-10">
            Your one-stop destination for premium products, unbeatable prices, and a shopping experience you'll love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="shine-hover inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-purple-300/50 hover:shadow-purple-400/70 hover:scale-105 transition-all duration-300"
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/products"
              className="glass inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-gray-700 hover:bg-white/90 hover:scale-105 transition-all duration-300"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 fade-in-up stagger-2">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: TrendingUp, title: 'Best Quality', desc: 'Curated products' },
            { icon: Sparkles, title: 'New Arrivals', desc: 'Updated weekly' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
                <p className="text-xs text-text-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12 fade-in-up stagger-1">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Shop by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-text-light">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {categories.map((cat, idx) => {
            const Icon = getIcon(cat.name);
            const gradient = categoryGradients[idx % categoryGradients.length];
            return (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className={`card-lift glass rounded-2xl p-6 text-center group cursor-pointer fade-in-up stagger-${idx + 1}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10 fade-in-up stagger-1">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Latest <span className="gradient-text">Products</span>
            </h2>
            <p className="text-text-light mt-1">Check out our newest arrivals</p>
          </div>
          <Link
            to="/products"
            className="glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/90 hover:scale-105 transition-all duration-300"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-text-light mt-4">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className={`fade-in-up stagger-${Math.min(idx + 1, 8)}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-text-light mb-6">Check back soon for amazing new arrivals!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-semibold hover:scale-105 transition-all"
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden fade-in-up stagger-3">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-pink-500/10 to-amber-500/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to <span className="gradient-text">Start Shopping</span>?
            </h2>
            <p className="text-text-light text-lg max-w-lg mx-auto mb-8">
              Join the Ree-Store family and discover amazing deals curated just for you.
            </p>
            <Link
              to="/products"
              className="shine-hover inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-purple-300/50 hover:shadow-purple-400/70 hover:scale-105 transition-all duration-300"
            >
              Explore All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
