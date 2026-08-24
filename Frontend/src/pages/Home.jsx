import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { SERVER_ORIGIN } from '../api/axios';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/products', { params: { limit: 6 } })
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error(err));

    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [products]);

  const currentProduct = products[current];

  return (
    <div>
      <div
  className="hero-banner"
  style={{ backgroundImage: `url(/hero_banner.jpg)` }}
>
        <div className="hero-overlay">
          <h1>Step Into ZeeCrumb</h1>
          <p>Quality clothing, honest prices — new pieces added every week.</p>
          <Link to="/products" className="hero-btn">Shop Now</Link>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="category-tiles">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="category-tile"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {products.length > 1 && (
        <div className="carousel">
          <h2 className="section-title">Featured Products</h2>
          <Link to={`/products/${currentProduct.id}`} className="carousel-slide">
            <img
              src={currentProduct.imageUrl ? `${SERVER_ORIGIN}${currentProduct.imageUrl}` : 'https://placehold.co/400x300?text=No+Image'}
              alt={currentProduct.name}
              className="carousel-img"
            />
            <div className="carousel-info">
              <h3>{currentProduct.name}</h3>
              <p>${currentProduct.price}</p>
            </div>
          </Link>
          <div className="carousel-dots">
            {products.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="about-section">
        <h2>About ZeeCrumb</h2>
        <p>
          ZeeCrumb started with a simple idea: everyday clothing shouldn't be
          overpriced or overcomplicated. We hand-pick every item in our catalog
          for quality and comfort, and we stand behind everything we sell.
          Whether you're after something casual or something sharp, we've got
          you covered.
        </p>
      </div>

      <div className="contact-section">
        <h2>Contact Us</h2>
        <p>Questions about an order or a product? Reach out anytime.</p>
        <p className="contact-info">📞 +20 101 749 4746</p>
        <p className="contact-info">✉️ ziadahmedweb@gmail.com</p>
      </div>

      <div className="founder-section">
        <div className="founder-card">
          <div className="founder-img-wrapper">
            <img
              src="/founder.jpeg"
              alt="Zee, Founder & CEO"
              className="founder-img"
            />
          </div>

          <h3 className="founder-name">Zee</h3>

          <span className="ceo-badge">
            Founder &amp; CEO
          </span>

          <p className="founder-text">
            Building ZeeCrumb with a focus on quality, affordability, and timeless style.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;