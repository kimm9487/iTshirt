import { Link } from 'react-router-dom'
import { useState } from 'react'
import { checkoutOrder, clearCartItems, pushCartItem } from '../api/client'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { formatPrice } from '../utils/catalog'

const DELIVERY_FEE = 3000
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'

export function CartPage() {
  const { items, updateItem, removeItem, clearCart } = useCart()
  const { products } = useProducts()
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutPending, setCheckoutPending] = useState(false)

  const rows = Object.entries(items)
    .map(([id, quantity]) => {
      const product = products.find((entry) => String(entry.id) === id)
      if (!product) return null
      return { product, quantity }
    })
    .filter(Boolean)

  const subtotal = rows.reduce((sum, row) => sum + row.product.salePrice * row.quantity, 0)
  const shipping = rows.length > 0 && subtotal < 30000 ? DELIVERY_FEE : 0
  const total = subtotal + shipping

  async function handleCheckout() {
    setCheckoutMessage('')
    setCheckoutPending(true)

    try {
      // 로컬 장바구니를 서버 DB에 먼저 동기화
      await clearCartItems()
      for (const [id, quantity] of Object.entries(items)) {
        for (let i = 0; i < Number(quantity); i += 1) {
          await pushCartItem(Number(id))
        }
      }

      const result = await checkoutOrder()
      await clearCart()
      setCheckoutMessage(`주문이 완료되었습니다. 주문번호: ${result.orderId}`)
    } catch (err) {
      if (err.status === 401) {
        setCheckoutMessage('로그인이 필요합니다. 로그인 후 다시 시도해 주세요.')
      } else if (err.status === 400) {
        setCheckoutMessage('재고가 부족합니다. 재고를 확인해 주세요.')
      } else {
        setCheckoutMessage('결제에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setCheckoutPending(false)
    }
  }

  return (
    <section className="section-block">
      <div className="section-head">
        <h2>장바구니</h2>
        <button type="button" className="link-button" onClick={clearCart}>전체 비우기</button>
      </div>

      {rows.length === 0 ? (
        <div className="empty-box">
          <p>장바구니가 비어 있습니다.</p>
          <Link to="/products">상품 보러가기</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {rows.map(({ product, quantity }) => (
              <li key={product.id} className="cart-item">
                <img src={product.imgPath || FALLBACK_IMAGE} alt={product.name} />
                <div>
                  <p className="cart-name">{product.name}</p>
                  <p>{product.displayPrice}</p>
                  <div className="qty-controls">
                    <button type="button" onClick={() => updateItem(product.id, quantity - 1)}>-</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => updateItem(product.id, quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-actions">
                  <p>{formatPrice(product.salePrice * quantity)}원</p>
                  <button type="button" className="link-button" onClick={() => removeItem(product.id)}>삭제</button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="summary-box">
            <h3>주문 요약</h3>
            <p>상품금액: {formatPrice(subtotal)}원</p>
            <p>배송비: {formatPrice(shipping)}원</p>
            <p className="summary-total">총 결제금액: {formatPrice(total)}원</p>
            <button type="button" onClick={handleCheckout} disabled={checkoutPending}>
              {checkoutPending ? '결제 처리 중...' : '결제하기'}
            </button>
            {checkoutMessage ? <p>{checkoutMessage}</p> : null}
          </aside>
        </div>
      )}
    </section>
  )
}
