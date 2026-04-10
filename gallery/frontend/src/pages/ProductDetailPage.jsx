import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { products } = useProducts()
  const { addItem } = useCart()

  const product = useMemo(
    () => products.find((entry) => String(entry.id) === String(productId)),
    [productId, products],
  )

  if (!product) {
    return (
      <section className="section-block">
        <p>상품을 찾을 수 없습니다.</p>
        <Link to="/products">상품 목록으로 돌아가기</Link>
      </section>
    )
  }

  const soldOut = Number(product.stock || 0) <= 0

  return (
    <section className="section-block detail-layout">
      <div className="detail-image-wrap">
        <img src={product.imgPath || FALLBACK_IMAGE} alt={product.name} className="detail-image" />
      </div>
      <div className="detail-content">
        <span className="badge">{product.category}</span>
        <h2>{product.name}</h2>
        <p className="price-row">
          {product.discountPer > 0 ? <del>{product.originalDisplayPrice}</del> : null}
          <strong>{product.displayPrice}</strong>
        </p>
        <p>재고: {product.stock ?? 0}개</p>
        <p>오늘 주문 시 내일 출고 예정 | 무료배송 기준 30,000원</p>
        <div className="detail-actions">
          <button type="button" onClick={() => addItem(product, 1)} disabled={soldOut}>
            {soldOut ? '품절' : '장바구니 담기'}
          </button>
          <Link className="ghost-link" to="/cart">장바구니 바로가기</Link>
        </div>
      </div>
    </section>
  )
}
