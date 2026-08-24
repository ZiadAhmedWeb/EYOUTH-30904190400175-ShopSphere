import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { resolveImageUrl } from '../api/axios';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState(null);

  const fetchReviews = () => {
    api.get(`/reviews/${id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load product');
        setLoading(false);
      });

    fetchReviews();
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      setMessage('Added to cart!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to add — are you logged in?');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMessage(null);
    try {
      await api.post(`/reviews/${id}`, { rating: parseInt(rating), comment });
      setComment('');
      setRating(5);
      fetchReviews();
      setReviewMessage('Review submitted!');
    } catch (err) {
      console.error(err);
      setReviewMessage(err.response?.data?.error || 'Failed to submit review — are you logged in?');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="product-detail">
        <img
          src={product.imageUrl ? resolveImageUrl(product.imageUrl) : 'https://placehold.co/350x350?text=No+Image'}
          alt={product.name}
          className="product-detail-img"
          style={{ maxWidth: '350px', flexShrink: 0 }}
        />

        <div className="product-detail-info">
          <h2>{product.name}</h2>
          {product.category && (
            <span className="category-tag">{product.category.name}</span>
          )}
          {avgRating && (
            <p className="avg-rating">⭐ {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</p>
          )}
          {product.description && (
            <p className="description">{product.description}</p>
          )}

          <div className="detail-row">
            <span>Price</span>
            <span>${product.price}</span>
          </div>
          <div className="detail-row">
            <span>Stock</span>
            <span>{product.stock} available</span>
          </div>

          <button onClick={addToCart}>Add to Cart</button>
          {message && <p style={{ marginTop: '0.8rem', color: 'var(--seagreen)' }}>{message}</p>}
        </div>
      </div>

      <div className="reviews-section">
        <h3>Reviews</h3>

        <form onSubmit={submitReview} className="review-form">
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </select>
          <textarea
            placeholder="Share your thoughts on this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <button type="submit">Submit Review</button>
          {reviewMessage && <p style={{ color: 'var(--seagreen)' }}>{reviewMessage}</p>}
        </form>

        {reviews.length === 0 ? (
          <p>No reviews yet — be the first!</p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review._id} className="review-item">
                <div className="review-header">
                  <span className="review-stars">{'⭐'.repeat(review.rating)}</span>
                  <span className="review-author">{review.userEmail}</span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;