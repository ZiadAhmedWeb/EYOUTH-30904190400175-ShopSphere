import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { SERVER_ORIGIN } from '../api/axios';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get('/products', { params: { search, category, sort, page } })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, [search, category, sort, page]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
  };

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Products</h2>

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => updateParam('search', e.target.value)}
        />

        <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
        </select>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : data.products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="product-grid">
            {data.products.map((product) => (
              <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                <img
                  src={product.imageUrl ? `${SERVER_ORIGIN}${product.imageUrl}` : 'https://placehold.co/220x220?text=No+Image'}
                  alt={product.name}
                  className="product-img"
                />
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
              </Link>
            ))}
          </div>

          <div className="pagination">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={p === parseInt(page)}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;