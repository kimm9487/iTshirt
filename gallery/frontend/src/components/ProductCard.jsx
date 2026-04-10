import { Link } from 'react-router-dom'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'

export function ProductCard({ product, onAddToCart }) {
  const soldOut = Number(product.stock || 0) <= 0

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <img
          src={product.imgPath || FALLBACK_IMAGE}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </Link>
      <div className="product-content">
        <span className="badge">{product.category}</span>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <p className="price-row">
          {product.discountPer > 0 ? <del>{product.originalDisplayPrice}</del> : null}
          <strong>{product.displayPrice}</strong>
        </p>
        <button type="button" onClick={() => onAddToCart(product)} disabled={soldOut}>
          {soldOut ? '품절' : '장바구니 담기'}
        </button>
      </div>
    </article>
  )
}
