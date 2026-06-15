import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { Spinner, EmptyState } from '../components/UI';
import { Package, SlidersHorizontal, X } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'DESC';

  useEffect(() => {
    categoryAPI.list().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productAPI.list({ page, search, category_id: categoryId, sort, order });
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, categoryId, sort, order]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = search || categoryId || sort !== 'created_at';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {search && <p className="text-sm text-text-light mt-1">Results for &quot;{search}&quot;</p>}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-surface md:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-text-light hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-light mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category_id', '')}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm ${!categoryId ? 'bg-primary text-white' : 'hover:bg-surface'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category_id', cat.id)}
                    className={`block w-full text-left px-3 py-1.5 rounded text-sm ${String(cat.id) === categoryId ? 'bg-primary text-white' : 'hover:bg-surface'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-light mb-2">Sort By</h4>
              <select
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split('-');
                  const params = new URLSearchParams(searchParams);
                  params.set('sort', s);
                  params.set('order', o);
                  params.set('page', '1');
                  setSearchParams(params);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none"
              >
                <option value="created_at-DESC">Newest</option>
                <option value="created_at-ASC">Oldest</option>
                <option value="price-ASC">Price: Low to High</option>
                <option value="price-DESC">Price: High to Low</option>
                <option value="name-ASC">Name: A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your filters or search terms"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={pagination.currentPage || page}
                totalPages={pagination.totalPages || 1}
                onPageChange={(p) => updateParam('page', p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
